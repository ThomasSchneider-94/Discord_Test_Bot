import { join } from 'path';
import { existsSync } from 'fs';
import { REST, Routes, PermissionsBitField } from 'discord.js';

import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';
import { env } from '#root/moddy.js'

import { MODULES_DIR } from '#paths';
import { InteractionExtended } from './models/InteractionExtended.js';
import { renderEmbed, getRoleName, formatRoleList, importFile, formatPermission } from '#utils';

export class Guild extends Module {
    constructor(guildId, guildName) {
        super(manifest, guildId, guildName);

        this.modules = new Map();
        this.installableModules = []; // List of modules not already installed on the server
        this.commands = new Map();
        this._securityConfigKey = 'security';
        this._modulesConfigKey = 'modules';
    }

    getModule(moduleName) {
        // Get an installed module
        if (!this.hasModule(moduleName)) { return undefined; }

        return moduleName == this.name ? this : this.modules.get(moduleName);
    }

    hasModule(moduleName) {
        return moduleName === this.name || this.modules.has(moduleName);
    }

    //#region Initialization
    async init(logLevel) {
        await super.init(logLevel);

        if (!this.configs[this._modulesConfigKey].installedModules) {
            this.configs[this._modulesConfigKey].installedModules = [];
        }

        // Create a map of all modules installed in the guild
        await this.loadModules();
        
        // Deploy all current commands
        await this.deployCommands();

        for (const manifest of env.manifests.values()) {
	        if (this.hasModule(manifest.name)) { continue; }
            this.installableModules.push(manifest.displayName);
        }

        return this;
    }

    async loadModules() {
        for (const moduleName of this.configs[this._modulesConfigKey].installedModules) {
            try {
                /// Create an instance of the Module class
                if (!env.manifests.has(moduleName)) { continue; }

                const moduleInstance = await this.loadModuleClass(env.manifests.get(moduleName));
                this.modules.set(moduleName, moduleInstance);

                for (const module of this.modules.values()) {
                    module.init(this.logger.logLevel);
                }
            } catch (error) {
                this.logger.error(`${error}`);
            }
        }
    }

    async loadModuleClass(manifest) {
        const classFile = join(MODULES_DIR, manifest.name, manifest.class + '.js')

        if (!existsSync(classFile)) { throw new Error(`No class file found for module "${manifest.name}"`); }
        
        const ModuleClass = (await importFile(classFile)).default;

        if (!ModuleClass) { throw new Error(`Class "${manifest.class}" not found in ${classFile}`); }

        const moduleInstance = new ModuleClass(this.guildId, this.guildName);
        return moduleInstance;
    }

    async deployCommands() {
        const commands = (await Promise.all([
            this.getCommands(),
            ...[...this.modules.values()].map(m => m.getCommands())
        ])).flat();

        const rest = new REST().setToken(env.clientConfig.token);

        try {
            this.logger.info(`Started refreshing ${commands.length} application /commands.`);
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = await rest.put(Routes.applicationGuildCommands(env.clientConfig.clientId, this.guildId), { body: commands });
            this.logger.info(`${data.length} application /commands reloaded.`);
            this.commands.clear();
            for (const command of commands) {
                this.commands.set(command.name, env.commandsByName.get(command.name).get(command.moduleName));
            }
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            this.logger.error(error);
        }
    }
    //#endregion Initialization

    async dispatchEvent(moduleName, eventFunction, ...args) {
        const module = this.getModule(moduleName);
        if (!module || !(eventFunction in module && typeof module[eventFunction] === 'function')) { return; }

        return await module.executeEvent(eventFunction, ...args);
    }

    //#region Events - Command handling
    async handleCommands(interaction) {
        if (interaction.isChatInputCommand()) {
            this.dispatchCommand(new InteractionExtended(interaction));
        }
        else if (interaction.isAutocomplete()) {
            if (!this.autocompleteCommand(interaction)) {
                interaction.respond([]);
            }
        }
        else {
            this.logger.warning(`Received non-command interaction: ${interaction.commandName}`);
        }
    }

    getCommand(interaction) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            this.logger.error(`No command matching ${interaction.commandName} was found.`);
            return undefined;
        }
        return command;
    }

    //#region Execution
    async dispatchCommand(interaction) {
        const command = this.getCommand(interaction);
        if (!command) { return; }

		if (!this.verifyPermissions(interaction, command)) {
			return interaction.replyError(`You don't have the permission to use this command.`);
		}
		
		const commandFunction = command.data.name.replace(/-/g, '_');

        const module = this.getModule(command.data.moduleName);
        if (!module) {
            this.logger.error(`Guild does not have the module required for command ${command.data.name}.`);
            return;
        }
        
        if (!(commandFunction in module && typeof module[commandFunction] === 'function')) {
            return this.logger.error(`Module "${command.data.moduleName}" does not have command "${command.data.name}".`);
        }

        // Get the command arguments from the interaction options
        const args = [interaction];
        if (command.data.options) {
            for (const option of command.data.options) {
                args.push(this.getArgumentValue(interaction.options, option));
            }
        }

        return await module.executeCommand(interaction, command.data.name, commandFunction, ...args)
    }

	verifyPermissions(interaction, command) {
        if(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            this.logger.debug("Command allowed because admin")
            return true;
        }

        const perms = this.getPermissionConfig(command.data.moduleName, command.data.name);
        return this.isMemberAllowed(interaction.guild, perms, interaction.member.roles);
	}

    getPermissionConfig(moduleName, commandName) {
		// Get the command permission. If no permission setup, take those of the module. If no module permission, allow by default
        const modulePerms = this.configs[this._securityConfigKey][moduleName];
		if (!modulePerms) { return { minRoleId: undefined, allowedRoleIds: undefined }; }

        let perms = { minRoleId: undefined, allowedRoleIds: undefined };
		const commandPerms = modulePerms[commandName];
		if (commandPerms) {
			perms.minRoleId = commandPerms.minRoleId ? commandPerms.minRoleId : modulePerms.minRoleId;
			perms.allowedRoleIds = commandPerms.allowedRoleIds.length !== 0 ? commandPerms.allowedRoleIds : modulePerms.allowedRoleIds;
		}
		else {
			perms.minRoleId = modulePerms.minRoleId;
			perms.allowedRoleIds = modulePerms.allowedRoleIds;
		}
        return perms;
    }

	isMemberAllowed(guild, perms, memberRoles) {
        if (perms.minRoleId) {
            const memberHighestRole = memberRoles.highest;
		    const minRole = guild.roles.cache.get(perms.minRoleId);

		    if (minRole && minRole.comparePositionTo(memberHighestRole) <= 0) { return true; }
		}
		if (perms.allowedRoleIds) {
            return memberRoles.cache.some(role => perms.allowedRoleIds.includes(role.id));
		}

        return true;
	}
	
	getArgumentValue(options, option) {
        switch (option.type) {
            case 3:     // String
                return options.getString(option.name)?.trim() || undefined;
            case 4:     // Integer
                return options.getInteger(option.name) || undefined;
            case 5:     // Boolean
                const value = options.getBoolean(option.name)
                return value === false || value === true ? value : undefined;
            case 6:     // User
                return options.getUser(option.name) || undefined;
            case 7:     // Channel
                return options.getChannel(option.name) || undefined;
            case 8:     // Role
                return options.getRole(option.name) || undefined;
            case 9:     // Mentionable (user or role)
                return options.getMentionable(option.name) || undefined;
            case 10:    // Number
                return options.getNumber(option.name) || undefined;
            case 11:    // Attachment
                return options.getAttachment(option.name) || undefined;
            default:
                return undefined;
        }
    }
    //#endregion Execution
    
    //#region Autocomplete
    async autocompleteCommand(interaction) {
        const command = this.getCommand(interaction);
        if (!command) { return; }

        if (!command.autocomplete) {
            return this.logger.warning(`Command ${interaction.commandName} does not have autocomplete choices defined.`);
        }

        const module = this.getModule(command.data.moduleName);
        if (!module) {
            return this.logger.error(`Guild does not have the module required for autocomplete of command ${command.data.name}.`);
        }
            
        const getter = this.autocompleteGetter(command, interaction);
        if (!getter) { return; }

        const resolver = module[getter.function];
        if (resolver === undefined) {
            return this.logger.warning(`No autocomplete getter "${getter.function}" defined for ${module.manifest.displayName}.`);
        }
        const autocompleValues = (typeof resolver === "function") ? await resolver.call(module, ...getter.args) : resolver;
        if (!Array.isArray(autocompleValues)) {
            return this.logger.warning(`Autocomplete value from getter "${getter.function}" for ${module.manifest.displayName} is not an array.`);
        }
    
        try {
            const focused = interaction.options.getFocused(true).value.toLowerCase();
            const filtered = autocompleValues
                .map(choice => ({ choice, score: this.scoreMatch(focused, choice) }))
                .filter(x => x.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 25)
                .map(x => x.choice);
            return await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
        } catch (error) {
            this.logger.error(error);
        }
    }

    autocompleteGetter(command, interaction) {
        if (typeof command.autocomplete !== 'object' && typeof command.autocomplete !== 'string') {
            return this.logger.warning(`Invalid autocomplete configuration for command ${command.data.name}.`);
        }

        let getter = command.autocomplete; // Getter can be a string, and object {function, args} or a map of the different autocomplete arguments
        if (typeof getter !== 'string') {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption && focusedOption.name in getter) {
                // If there is multiple autocomplete options, get the focused one
                getter = getter[focusedOption.name];
            }
        }
        
        if (typeof getter === 'string') {
            // If the autocomplete is defined as a simple string, use it directly as the name of the getter function providing the choices
            return { function: getter };
        }
        // If the autocomplete is defined as a function depending on other options, get the args
        const getterArgs = []
        for (const arg of getter.args) {
            getterArgs.push(interaction.options.get(arg)?.value);
        }

        if (typeof getter.function !== 'string') {
            return this.logger.warning(`Invalid autocomplete configuration for command ${command.data.name}: getter function is not a string.`);
        }
        return { function: getter.function, args: getterArgs };
    }

    scoreMatch(input, choice) {
        input = input.toLowerCase();
        choice = choice.toLowerCase();

        if (choice === input) return 100;
        if (choice.startsWith(input)) return 75;
        if (choice.includes(input)) return 50;

        // fuzzy match (very lightweight)
        let score = 0;
        let i = 0;
        for (const char of choice) {
            if (char === input[i]) {
                score += 5;
                i++;
            }
            if (i >= input.length) break;
        }
        return score;
    }
    //#endregion Autocomplete

    //#endregion Events - Command handling

    //#region Commands

    //#region Help
    async help(interaction, module, commandName) {
        let templateName, context;
        if (commandName) {
            const result = env.getCommandData(commandName);
            if (!result.success) { return interaction.replyError(error); }
            templateName = 'help_command'
            context = this.getCommandHelpContext(interaction.guild, result.command);
        }
        else if (module) {
            const moduleName = env.getModuleName(module);
            if (!moduleName) { return interaction.replyError(`Module \`${module}\` does not exist.`); }

            templateName = 'help_module'
            context = this.getModuleHelpContext(moduleName);
        }
        else {
            templateName = 'help_general';
            context = { 
                clientId: env.clientConfig.clientId,
                permBitField: new PermissionsBitField([...this.manifest.permissions, ...Array.from(this.modules.values()).map(module => module.manifest.permissions)]).bitfield
            };
        }
        
        const template = await this.importTemplate(templateName);
        return interaction.replyWithEmbed([renderEmbed(template, context)], true);
    }

    getCommandHelpContext(guild, command) {
        return {
            name: command.name,
            moduleName: command.moduleDisplayName,
            description: command.description,
            args: command.args,
            permissions: this.hasModule(command.moduleName)
                ? this.getCommandPermissionContext(guild, command)
                : undefined
        }
    }

    getModuleHelpContext(moduleName) {
        const moduleManifest = env.manifests.get(moduleName);
        return {
            name: moduleManifest.name,
            displayName: moduleManifest.displayName,
            description: moduleManifest.description,
            commands: moduleManifest.commands,
            permissions: moduleManifest.permissions 
                ? new PermissionsBitField(moduleManifest.permissions).toArray().map(perm => formatPermission(perm))
                : undefined,
            features: moduleManifest.features
        };
    }

    // Autocomplete
    get allModules() {
        return Array.from(env.displayNameToName.keys());
    }

    // Autocomplete
    commandByModule(module) {
        const moduleManifest = env.getManifest(module);
        if (moduleManifest) {
            return moduleManifest.commands?.map(command => command.name) || [];
        }

        const commandNames = [];
        for (const [name, moduleMap] of env.commandsByName.entries()) {
            if (moduleMap.size === 1) {
                commandNames.push(name);
            } 
            else {
                for (const command of moduleMap.values()) {
                    commandNames.push(`${name} (${command.moduleDisplayName})`);
                }
            }
        }
        return commandNames;
    }
    //#endregion Help

    //#region Security
    permissions(interaction, action, module, command, role, includeHigherRoles) {
        switch (action) {
		    case 'add':
                if (module) {}
                return this.addPermission(interaction, module, command, role, includeHigherRoles);
		    case 'remove':
                return this.removePermission(interaction,  module, command, role, includeHigherRoles);
		    case 'view':
                return this.viewPermission(interaction, module, command, role);
		    default:
		    	return interaction.replyError('Unknown action');
	    }
    }

    addPermission(interaction, module, commandName, role, includeHigherRoles) {
        if (!module && !commandName) {
            return interaction.replyError('You must provide a module or command name.');
        }
        if (!role) {
            return interaction.replyError('Please provide a role.');
        }

        let command = undefined;
        if (commandName) {
            command = this.commands.get(commandName);
            if (!command) { return interaction.replyError(`Command \`${commandName}\` does not exist.`); }
        }

        const moduleName = command ? command.moduleName : env.getModuleName(module);
        if (!moduleName || !this.modules.has(moduleName)) {
            return interaction.replyError(`Module \`${module}\` does not exist or is not installed on the server.`);
        }

        if (!this.configs[this._securityConfigKey][moduleName]) {
            this.configs[this._securityConfigKey][moduleName] = {
                minRoleId: undefined,
                allowedRoleIds: []
            };
        }
        if (command && !this.configs[this._securityConfigKey][moduleName][command.name]) {
            this.configs[this._securityConfigKey][moduleName][command.name] = {
                minRoleId: undefined,
                allowedRoleIds: []
            };
        }
        const group = command ? this.configs[this._securityConfigKey][moduleName][command.name] : this.configs[this._securityConfigKey][moduleName];
        if (includeHigherRoles) {
            group.minRoleId = role.id;
        }
        else if (!group.allowedRoleIds.includes(role.id)) {
            group.allowedRoleIds.push(role.id);
        }
        this.writeConfig(this._securityConfigKey);

        return interaction.replySuccess(`Permission added to${includeHigherRoles ? ' all role higher than' : ''} ${role.toString()} for ${this.displayCommandOrModule(command, moduleName)}`);
    }

    removePermission(interaction, module, commandName, role, includeHigherRoles) {
        if (!module && !commandName) {
            return interaction.replyError('You must provide a module or command name.');
        }
        let command = undefined;
        if (commandName) {
            command = this.commands.get(commandName);
            if (!command) { return interaction.replyError(`Command \`${commandName}\` does not exist.`); }
        }

        const moduleName = command ? command.moduleName : env.getModuleName(module);
        if (!moduleName || !this.hasModule(moduleName)) { return interaction.replyError(`Module \`${module}\` does not exist or is not installed on the server.`); }
        
        const group = command ? this.configs[this._securityConfigKey][moduleName][command.name] : this.configs[this._securityConfigKey][moduleName];
        if (!group) { return interaction.replyError(`No permissions are configured for ${this.displayCommandOrModule(command, moduleName)}.`); }

        if (!role && !includeHigherRoles) {
            group.minRoleId = undefined;
            group.allowedRoleIds = [];
            this.writeConfig(this._securityConfigKey);
            return interaction.replySuccess(`All permissions have been cleared for ${this.displayCommandOrModule(command, moduleName)}`);
        }

        const successParts = [];
        const errorParts = [];
        if (includeHigherRoles) {
            if (group.minRoleId) {
                group.minRoleId = undefined;
                successParts.push(`Removed minimum role ${getRoleName(interaction.guild, group.minRoleId)} requirement`);
            } else {
                errorParts.push('No minimum role requirement was set');
            }
        }
        if (role) {
            // Remove the role from the allowed list
            const index = group.allowedRoleIds.indexOf(role.id);
            if (index > -1) {
                group.allowedRoleIds.splice(index, 1);
                successParts.push(`Removed role "${role.name}"`);
            } else {
                errorParts.push(`Role "${role.name}" was not in the allowed list`);
            }
            // If the role was the minimum role, remove it
            if (group.minRoleId === role.id) {
                group.minRoleId = undefined;
                successParts.push(`Removed minimum role ${getRoleName(interaction.guild, group.minRoleId)} requirement`);
            }
        }
        this.writeConfig(this._securityConfigKey);
        
        if (successParts.length === 0) {
            return interaction.replyError(
                `No changes were made to ${this.displayCommandOrModule(command, moduleName)}. ${errorParts.length ? `\n- ${errorParts.join('\n- ')}` : 'Nothing matched your request.'}`
            );
        }

        return interaction.replySuccess(
            `Permissions updated for ${this.displayCommandOrModule(command, moduleName)}:\n${successParts.join('\n')}` +
            (errorParts.length ? `\n⚠️ Not applied:\n- ${errorParts.join('\n- ')}` : '')
        );
    }

    displayCommandOrModule(command, moduleName) {
        return command ? `command \`/${command.name}\``: `module **${moduleName}**`;
    }

    async viewPermission(interaction, module, commandName, role) {
        if (role && (module || commandName)) {
            return interaction.replyError('Please use only a role, a command or a module. If module and command are specified, only command will be considered.');
        }
        if (!module && !commandName && !role) {
            return interaction.replyError('You must provide a role, module or command name.');
        }

        let templateName;
        let context;
        if (commandName) {
            const command = this.commands.get(commandName);
            if (!command) { return interaction.replyError(`Command \`${commandName}\` does not exist.`); }

            templateName = 'perm_command'
            context = this.getCommandPermissionContext(interaction.guild, command);
        }
        else if (module) {
            const moduleManifest = env.getManifest(module);
            if (!moduleManifest || !this.hasModule(moduleManifest.name)) { return interaction.replyError(`Module \`${module}\` does not exist or is not installed on the server.`); }

            templateName = 'perm_module';
            context = this.getModulePermissionContext(interaction.guild, moduleManifest);
        }
        else {
            templateName = 'perm_role';
            context = this.getRolePermissionContext(interaction.guild, role);
        }

        const template = await this.importTemplate(templateName);
        return interaction.replyWithEmbed([renderEmbed(template, context)], true);
    }

    getModulePermissionContext(guild, moduleManifest) {
        const perms = this.configs[this._securityConfigKey][moduleManifest.name];
        if (!perms) {
            return {
                module: {
                    name: moduleManifest.name,
                    displayName: moduleManifest.displayName
                },
                minRole: undefined,
                allowedRoles: [],
            }
        }

        const modifiedCommands = [];
        const followModulePermsCommands = [];
        for (const command of moduleManifest.commands) {
            command.name in perms
                ? modifiedCommands.push({ name: command.name, minRole: getRoleName(guild, perms[command.name].minRoleId), allowedRoles: formatRoleList(guild, perms[command.name].allowedRoleIds) })
                : followModulePermsCommands.push(command.name);
        }
        
        return {
            module: {
                name: moduleManifest.name,
                displayName: moduleManifest.displayName
            },
            minRole: getRoleName(guild, perms.minRoleId),
            allowedRoles: formatRoleList(guild, perms.allowedRoleIds),
            followModulePermsCommands: followModulePermsCommands,
            modifiedCommands: modifiedCommands
        }
    }

    getCommandPermissionContext(guild, command) {
        const modulePerms = this.configs[this._securityConfigKey][command.moduleName];
        if (!modulePerms) {
            return {
                name: command.name,
                effectiveMinRole: undefined,
                effectiveAllowedRoles: undefined
            };
        }
        const commandPerms = modulePerms[command.name];
        const effectiveMinRoleId = commandPerms?.minRoleId ? commandPerms?.minRoleId : modulePerms.minRoleId;
        const effectiveAllowedRoleIds = commandPerms?.allowedRoleIds?.length > 0 ? commandPerms?.allowedRoleIds : modulePerms.allowedRoleIds;

        return {
            name: command.name,
            effectiveMinRole: getRoleName(guild, effectiveMinRoleId),
            effectiveAllowedRoles: formatRoleList(guild, effectiveAllowedRoleIds),
            minRoleFromModule: !commandPerms?.minRoleId && effectiveMinRoleId,
            allowedRolesFromModule: !commandPerms?.allowedRoleIds?.length > 0 && effectiveAllowedRoleIds.length > 0
        };
    }

    getRolePermissionContext(guild, role) {
        const perms = this.configs[this._securityConfigKey];
        const modules = [];

        for (const moduleName of Array.from(this.modules.keys()).concat(this.name)) {
            const modulePerms = perms[moduleName];
            const moduleManifest = env.manifests.get(moduleName);
            if (!modulePerms) {
                // Undefined perms for the module, so no restriction. 
                modules.push({ name: moduleName, displayName: moduleManifest.displayName, commands: undefined });
                continue; 
            }

            const moduleAllowed = this.isRoleAllowed(guild, modulePerms, role);
            const commands = [];
            for (const command of moduleManifest.commands) {
                if (command.name in modulePerms) {
                    this.isRoleAllowed(guild, modulePerms[command.name], role) ? commands.push(command.name) : null;
                }
                else {
                    moduleAllowed ? commands.push(command.name) : null;
                }
            }
            commands.length === moduleManifest.commands.length
                ? modules.push({ name: moduleName, displayName: moduleManifest.displayName, commands: undefined })
                : modules.push({ name: moduleName, displayName: moduleManifest.displayName, commands: commands });   
        }

        return {
            role: role.name,
            modules: modules,
        };
    }

    isRoleAllowed(guild, perms, role) {
        if (perms.minRoleId) {
		    const minRole = guild.roles.cache.get(perms.minRoleId);

		    if (minRole && minRole.comparePositionTo(role) <= 0) { return true; }
		}
		if (perms.allowedRoleIds) {
            return role.id in perms.allowedRoleIds;
		}

        return true;
    }

    // Autocomplete
    guildCommandsByModule(module) {
        const moduleName = env.getModuleName(module);
        if (!moduleName) { return Array.from(this.commands.keys()); }
        return Array.from(this.commands.values()).filter(command => command.moduleName === moduleName).map(command => command.name);
    }

    // Autocomplete
    get managableModuleNames() {
        return Array.from(this.modules.values()).map(module => module.manifest.displayName).concat(this.manifest.displayName);
    }
    //#endregion Security

    //#region Manage Modules
    module(interaction, action, module) {
        const moduleName = env.getModuleName(module);
        if (!moduleName) {
            return interaction.replyError(`Module \`${module}\` does not exist.`);
        }
        else if (moduleName === this.name) {
            return interaction.replyError(`You cannot add or remove the guild module.`);
        }

        switch (action) {
		    case 'add':
                return this.addModule(interaction, moduleName);
		    case 'remove':
                return this.removeModule(interaction, moduleName);
		    default:
		    	return interaction.replyError('Unknown action');
	    }
    }

    async addModule(interaction, moduleName) {
        // Check if the module is already installed on the server
        if (this.modules.has(moduleName)) { return interaction.replyError(`Module \`${moduleName}\` is already installed.`); }
        await interaction.deferReply();

        const moduleManifest = env.manifests.get(moduleName);
        const permModif = this.permissionModification(moduleManifest);

        // Create an instance of the module and add it to the server
        const moduleInstance = await this.loadModuleClass(moduleManifest);
        await moduleInstance.init(this.logger.logLevel);
        this.modules.set(moduleName, moduleInstance);

        this.updateModules(moduleManifest);
        return interaction.editReplySuccess(`Module \`${moduleManifest.name}\` added!${permModif ? ` The bot required more permissions, please update them using this [link](https://discord.com/oauth2/authorize?client_id=${env.clientConfig.clientId}&scope=bot&permissions=${this.neededPermissions}).` : ''}`);
    }
    
    async removeModule(interaction, moduleName) {
        // Check if the module is already installed on the server
        if (!this.modules.has(moduleName)) { return interaction.replyError(`Module \`${moduleName}\` is not installed.`); }
        await interaction.deferReply();

        const moduleManifest = env.manifests.get(moduleName);
        const permModif = this.permissionModification(moduleManifest);

        // Delete the module instance
        this.modules.delete(moduleName);

        this.updateModules(moduleManifest);
        return interaction.editReplySuccess(`Module \`${moduleManifest.name}\` removed!${permModif ? ` The bot needs less permissions, your may update them using this [link](https://discord.com/oauth2/authorize?client_id=${env.clientConfig.clientId}&scope=bot&permissions=${this.neededPermissions}).` : ''}`);
    }

    get neededPermissions() {
        const perms = new Set(this.manifest.permissions ? this.manifest.permissions : []) ;
        for (const module of this.modules.values()) {
            if (module.manifest.permissions) {
                for (const perm of module.manifest.permissions) {
                    perms.add(perm);
                }
            }
        }
        return new PermissionsBitField(Array.from(perms)).bitfield;
    }

    permissionModification(modifiedModuleManifest) {
        // Update the bot permissions if the modified module add or remove required perms
        if (!modifiedModuleManifest.permissions) { return false; }

        const perms = new Set(this.manifest.permissions ? this.manifest.permissions : []) ;
        for (const module of this.modules.values()) {
            if (module.name != modifiedModuleManifest.name && module.manifest.permissions) {
                for (const perm of module.manifest.permissions) {
                    perms.add(perm);
                }
            }
        }
        const withoutModuleBitfield = new PermissionsBitField(Array.from(perms)).bitfield;

        for (const perm of modifiedModuleManifest.permissions) {
            perms.add(perm);
        }
        const withModuleBitfield = new PermissionsBitField(Array.from(perms)).bitfield;

        if (withoutModuleBitfield !== withModuleBitfield) {
            return true;
        }
        return false;        
    }

    updateModules(moduleManifest) {
        // Update the server commands if the module has any
        if (moduleManifest.commands) {
            this.scheduleDeployCommands();
        }

        // Update the configuration to reflect the newly installed module
        this.configs[this._modulesConfigKey].installedModules = Array.from(this.modules.keys());
        this.writeConfig(this._modulesConfigKey);
        
        this.installableModules = Array.from(env.manifests.values()).filter(moduleName => !this.hasModule(moduleName)).map(module => module.displayName);
    }

    scheduleDeployCommands() {
        clearTimeout(this.deployTimeout);

        this.deployTimeout = setTimeout(() => {
            this.deployCommands();
        }, 10000);
    }

    // Autocomplete
    autocompleteModule(action) {
        switch (action) {
		    case 'add':
                return this.installableModules;
		    case 'remove':
                return Array.from(this.modules.values()).map(module => module.manifest.displayName);
		    default:
		    	return [];
	    }
    }
    //#endregion Manage Modules

    //#endregion Commands
}
export default Guild;
