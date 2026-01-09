import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { Guild } from '#modules/guild/Guild.js'
import { Logger } from './models/Logger.js'

import { MODULES_DIR, CORE_DIR, __manifestFile, __eventsDir } from '#paths';
import { EVENT_CONFIG } from './configs/EVENT_CONFIG.js'
import { importFile } from '#utils'

export class Moddy {
    constructor() {
        this.logger = new Logger('moddy');
        this.eventFiles = ['join_guild.js', 'leave_guild.js'];
        this.clientConfig = {}; // Secret config

        this.client = new Client({
        	intents: [
        		GatewayIntentBits.Guilds,
        		GatewayIntentBits.GuildMessages,
        		GatewayIntentBits.GuildMessageReactions,
        		GatewayIntentBits.MessageContent,
        		GatewayIntentBits.GuildVoiceStates
        	],
        	partials: [
        		Partials.Message,
        		Partials.Channel,
        		Partials.Reaction
        	],
        });
        this.client.commands = new Collection();
        this.guilds = new Map();

        this.staticData = {
            manifests: new Map(),
            displayNameToName: new Map(),
            commandsByName: new Map()
        }
    }

    //#region Initialization
    async init(logLevel, allowededModules) {
        // Adapt to the required log levels
        this.logger.setLevel(logLevel);

        // Load the environment 
        this.clientConfig = JSON.parse(readFileSync(join(CORE_DIR, 'secretConfig.json'), 'utf-8'));

        // Create all modules once to regsiter the events, commands and manifests
        const dummyModules = await this.loadDummyModules(allowededModules);

        /// Register all events and commands
        const events = [];
        for (const eventFile of this.eventFiles) {
            events.push(this.registerEvent('moddy', await importFile(CORE_DIR, __eventsDir, eventFile)));
        }
        this.logger.info(`Registered events for moddy: [${events.filter(e => !!e).map(e => e.name).join(', ')}]`);
        await this.registerModules(dummyModules);

        /// Save commands
        this.saveCommandsByName()

        /// Login
        this.client.login(this.clientConfig.token);
        
        /// Create all guild module
        await this.loadGuildModules();

        return this;
    }

    //#region Load dummy modules
    async loadDummyModules(allowededModules = []) {
        const modules = [];
        if (allowededModules.length == 0) {
            allowededModules = readdirSync(MODULES_DIR);
        }
        else if (!allowededModules.includes('guild')) {
            allowededModules.push('guild');
        }
        for (const allowededModule of allowededModules) {
            const module = await this.loadDummyModule(allowededModule);
            if (module) {
                modules.push(module);
            }
        }
    
        return modules;
    }

    async loadDummyModule(moduleName) {
        const manifestFile = join(MODULES_DIR, moduleName, __manifestFile);
        if (!existsSync(manifestFile)) {
            return this.logger.error(`File ${manifestFile} does not exist`)
        }
    
        const { manifest } = await importFile(manifestFile);
        if (!manifest || !manifest.name || manifest.name != moduleName) { 
            return this.logger.error(`${moduleName} manifest content does not match with it's folder`)
        }

        const classFile = join(MODULES_DIR, manifest.name, manifest.class + '.js');
        if (!existsSync(classFile)) { 
            return this.logger.error(`No class file found for module "${manifest.name}"`)
        }

        try {
            const ModuleClass = (await importFile(classFile)).default;
            if (!ModuleClass) { throw new Error(`Class "${manifest.class}" not found in ${classFile}`); }

            const moduleInstance = new ModuleClass("moddy", "moddy");
            this.staticData.manifests.set(manifest.name, manifest);
            this.staticData.displayNameToName.set(manifest.displayName, manifest.name);
            return moduleInstance;
        }
        catch(error) {
            return this.logger.error(`Dummy module ${moduleName} creation: ${error}`);
        }
    }
    //#endregion Load dummy modules

    //#region Register events and commands
    async registerModules(modules) {
        for (const module of modules) {
            await this.registerModule(module)
        }
    }

    async registerModule(module) {
        if (module.manifest.events) {
            const events = [];
            for (const event of module.manifest.events) {
                events.push(this.registerEvent(module.manifest.name, await module.importEvent(event)));
            }
            this.logger.info(`Registered events for ${module.manifest.name}: [${events.filter(e => !!e).map(e => e.name).join(', ')}]`);
        }
        
        if (module.manifest.commands) {
            const commands = [];
            for (const command of module.manifest.commands) {
                commands.push(this.registerCommand(module.manifest.name, await module.importCommand(command.file)));
            }
            this.logger.info(`Registered commands for ${module.manifest.name}: [${commands.filter(c => !!c).map(c => c.data.name).join(', ')}]`);
        }
    }

    registerEvent(moduleName, event) {
        if (event.once == undefined || !event.name || !event.execute) {
            this.logger.warning(`The event ${event.name} for module ${moduleName} is missing a required "once", "name" or "execute" property.`)
            return;
        }
    
        if (event.once) {
            this.client.once(event.name, (...args) => this.eventHandler(moduleName, event.name, event.execute, ...args));
        } else {
            this.client.on(event.name, (...args) => this.eventHandler(moduleName, event.name, event.execute, ...args));
        }
        return event;
    }

    registerCommand(moduleName, command) {
        if (!command.data || !command.data.name) {
            this.logger.warning(`The command at ${command.filePath} for module ${moduleName} is missing a required "data" or "execute" property.`);
            return;
        }
    
        command.data.moduleName = moduleName;
        this.client.commands.set(command.data.name, command);
        return command;
    }
    //#endregion Register events and commands

    saveCommandsByName() {
        this.staticData.commandsByName.clear();
        for (const moduleManifest of this.staticData.manifests.values()) {
            if (!moduleManifest.commands) { continue; }

            for (const command of moduleManifest.commands) {
                command.moduleName = moduleManifest.name;
                command.moduleDisplayName = moduleManifest.displayName;

                if (!this.staticData.commandsByName.has(command.name)) {
                    this.staticData.commandsByName.set(command.name, new Map());
                }

                this.staticData.commandsByName.get(command.name).set(moduleManifest.name, command);
            }
        }
    }

    async loadGuildModules() {
        const guilds = await this.client.guilds.fetch();

        for (const guild of guilds.values()) {
            await this.loadGuildModule(guild);            
        }
    }

    async loadGuildModule(guild) {
        const guildModule = new Guild(guild.id, guild.name, this);
        await guildModule.init(this.logger.logLevel);
        
        // Initialize the base module with all its sub-modules
        this.guilds.set(guild.id, guildModule);
        this.logger.info(`Bot joined guild ${guild.name}`)
    }
    //#endregion Initialization

    //#region Events
    guildJoin(guild) {
        if (!guild.available) {
            this.logger.warning(`Guild ${guild.name} not available`);
            return;
        }

        this.loadGuildModule(guild);
    }

    guildLeave(guild) {
        if (!guild.available) {
            this.logger.warning(`Guild ${guild.name} not available`);
            return;
        }

        if (this.guilds.has(guild.id)) {
            this.guilds.delete(guild.id);
            this.logger.info(`Bot has left the guild ${guild.name}`)
        }
    }
    //#endregion Events

    eventHandler(moduleName, eventName, eventFunction, ...args) {
        const eventConfig = EVENT_CONFIG[eventName];

        if (!eventConfig) { // If the event isn't defined, stop the process
            this.logger.error(`Event ${eventName} not recognised`)
            return;
        } 
        else if (eventConfig.scope === 'core') { // Case if the event concerns the core module
            if (eventFunction in this && typeof this[eventFunction] === 'function') {
                this[eventFunction](...args);
            }
            return;
        }
        else if (eventConfig.scope === 'global') {
            for (const guild of this.guilds.values()) {
                guild.dispatchEvent(moduleName, eventFunction, ...args);
            }
            return;
        }

        const guildId = eventConfig.guildExtractor(...args);
        if (this.guilds.has(guildId)) {
             this.guilds.get(guildId).dispatchEvent(moduleName, eventFunction, ...args)
        }
    }

    //#region Getter
    get displayNames() {
        return Array.from(this.displayNamesToNames.keys());
    }

    get manifests() {
        return this.staticData.manifests;
    }

    get displayNameToName() {
        return this.staticData.displayNameToName;
    }

    get commandsByName() {
        return this.staticData.commandsByName;
    }

    getModuleName(displayName) {
        if (this.staticData.displayNameToName.has(displayName)) {
            return this.staticData.displayNameToName.get(displayName)
        }
        else if (this.staticData.manifests.has(displayName)) { 
            return displayName 
        }
        return undefined;
    }

    getManifest(moduleName) {
        if (this.staticData.displayNameToName.has(moduleName)) {
            moduleName = this.staticData.displayNameToName.get(moduleName);
        }
        return this.staticData.manifests.has(moduleName) ?  this.staticData.manifests.get(moduleName) : undefined;
    }

    getCommandData(commandString) {
        const match = commandString.match(/^(.+?)(?: \((.+)\))?$/);
        if (!match) { return { success: false, error: 'No command matches your argument. Use `command (module)` format.' }; }
        
        const [, commandName, moduleDisplayName] = match;
        const commandMap = this.staticData.commandsByName.get(commandName);
        if (!commandMap) { return { success: false, error: `Command \`${commandName}\` does not exist.` }; }
        if (commandMap.size === 1) {
            return { success: true, command: commandMap.values().next().value };
        }
        else {
            if (!moduleDisplayName) { 
                const modules = Array.from(commandMap.values()).map(cmd => cmd.moduleDisplayName).join(', ');
                return {success: false, error: `Multiple modules provide \`${commandName}\`: ${modules}. Use \`command (module)\`.` };
            }
            const moduleName = this.getModuleName(moduleDisplayName);
            if (!commandMap.has(moduleName)) { return { success: false, error: `Command \`${commandName}\` of module \`${moduleDisplayName}\` does not exist.` }; }
            return { success: true, command: commandMap.get(moduleName) };
        }
    }
    //#endregion Getter
}
