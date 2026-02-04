import { join, basename } from 'path';
import { readFileSync } from 'fs';

import { ModuleLogger } from './ModuleLogger.js';
import { MODULES_DIR } from '../utils/paths.js';

// Abstract Module class
export class Module {
    constructor(guildId, guildName, name) {
        if (!guildId || !name) {
            throw new Error(`Invalid module data provided for module: ${name || 'unknown'} for guild: ${guildId || 'unknown'}`);
        }       
        
        this.guildId = guildId;
        this.guildName = guildName;
        this.name = name;        
        this.logger = new ModuleLogger(this.guildId, this.guildName, this.name);
        this.configs = {};
        this.initialized = false;
    }

    async init(data) {        
        this.loadConfigs(data.configs || []);
        this.registerCommands();
        
        this.initialized = true;
        this.logger.info(`Module initialized`);
        return this;
    };

    /// Configuration Loading
    loadConfigs(configFiles) {
        for (const configFile of configFiles) {
            this.loadConfig(configFile);
        }
    }

    loadConfig(configFile) {
        const key = basename(configFile, '.json');

        const config = JSON.parse(readFileSync(this.getConfigFile(configFile), 'utf-8'));
        this.configs[key] = config[this.guildId] || {};

        this.logger.debug(`Configuration file "${configFile}" loaded: ${JSON.stringify(this.configs[key])}`);
    }
    
    /// Commands Registration
    registerCommands() {
        this.logger.debug(`Registering commands for module: ${this.name}`);
    }

    /// File paths
    moduleFileToPath(...pathParts) {
        return join(MODULES_DIR, this.name, ...pathParts);
    }

    getDataFile(...pathParts) {
        return this.moduleFileToPath('data', ...pathParts);
    }

    getConfigFile(file) {
        return this.moduleFileToPath('configs', file);
    }

    getManifestFile() {
        return this.moduleFileToPath('__manifest__.js');
    }
}
