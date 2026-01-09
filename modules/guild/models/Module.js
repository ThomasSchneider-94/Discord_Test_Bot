import { join, basename } from 'path';
import { readFileSync, writeFileSync } from 'fs';

import { importFile } from '#utils';
import { MODULES_DIR, __configsDir, __commandsDir, __eventsDir, __dataDir, __templatesDir } from '#paths';
import { ModuleLogger } from './ModuleLogger.js';

/// Abstract Module class
export class Module {
    constructor(manifest, guildId, guildName) {
        if (!manifest.name) {
            throw new Error(`Invalid manifest provided: name = ${manifest.name || 'unknown'}`);
        }
        if (!guildId) {
            throw new Error(`Invalid arguments provided for module ${manifest.name}: guild = ${guildId || 'unknown'}`);
        }
        
        this.manifest = manifest;
        this.name = this.manifest.name;
        this.guildId = guildId;
        this.guildName = guildName;
        this.logger = new ModuleLogger(this.name, this.guildName)
        this.configs = {};
        this.configKeys - {};
    }

    async init(logLevel) {
        this.logger.setLevel(logLevel);
        this.loadConfigs(this.manifest.configs || []);
        
        return this;
    };

    async executeCommand(interaction, commandName, commandFunction, ...args) {
        try {
            await this[commandFunction](...args);
        } catch (error) {
            this.logger.error(`Command ${commandName} execution: ${error}`);

            const displayError = `Internal error:\n\`\`\`${error}\`\`\``;
            if (interaction.replied || interaction.deferred) {
                await interaction.deleteReply().catch(() => {});
                return await interaction.followUpError(displayError);
            } else {
                return await interaction.replyError(displayError);
            }
        }
    }

    async executeEvent(eventFunction, ...args) {
        try {
            await this[eventFunction](...args);
        } catch (error) {
            this.logger.error(`Event "${eventFunction}" error: ${error}`);
        }
    }

    //#region Configuration
    loadConfigs(configFiles) {
        for (const configFile of configFiles) {
            this.loadConfig(configFile);
        }
    }

    loadConfig(configFile) {
        const key = basename(configFile, '.json');

        const config = JSON.parse(readFileSync(this.getConfigFile(configFile), 'utf-8'));
        this.configs[key] = config[this.guildId] || {};

        this.logger.debug(`Configuration file "${configFile}" loaded`);
    }

    writeConfig(configKey) {
        const configFile = JSON.parse(readFileSync(this.getConfigFile(configKey + '.json'), 'utf-8'));

        configFile[this.guildId] = this.configs[configKey];
        writeFileSync(this.getConfigFile(configKey + '.json'), JSON.stringify(configFile, null, 4), 'utf8');
    }
    //#endregion Configuration

    async getCommands() {
        if (!this.manifest.commands) { return []; }
        const commands = [];

        for(const commandData of this.manifest.commands) {
            const command = await this.importCommand(commandData.file);
            
            if (command.data === undefined) {
                this.logger.warning(`The command at ${command.filePath} is missing a required "data" or "execute" property.`);
                continue;
            }
            commands.push(command.data.toJSON());
        }
        return commands;
    }
    
    //#region Paths
    get modulePath() {
        return join(MODULES_DIR, this.name);
    }

    getEventFile(file) {
        return join(this.modulePath, __eventsDir, file);
    }

    getCommandFile(file) {
        return join(this.modulePath, __commandsDir, file);
    }

    getConfigFile(file) {
        return join(this.modulePath, __configsDir, file);
    }

    getTemplateFile(file) {
        return join(this.modulePath, __templatesDir, file);
    }

    getDataFile(...pathParts) {
        return join(this.modulePath, __dataDir, ...pathParts);
    }
    //#endregion Paths

    //#region Import
    async importEvent(file) {
        return await importFile(this.getEventFile(file));
    }

    async importCommand(file) {
        return await importFile(this.getCommandFile(file));
    }

    async importConfig(file) {
        return await importFile(this.getConfigFile(file));
    }

    async importTemplate(file) {
        const { template } = await importFile(this.getTemplateFile(file + '.js'));
        return template;
    }

    async importData(...pathParts) {
        return await importFile(this.getDataFile(...pathParts));
    }
    //#endregion Import
}
