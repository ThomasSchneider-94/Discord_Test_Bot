import { Module } from '../modules/Module.js';

class GuildWithModule {
    constructor(guildId) {
        this.guildId = guildId;
        this.modules = new Map();
    }

    #loadModules(moduleNames) {
        for (const moduleName of moduleNames) {
            const module = this.#loadModule(moduleName);
            this.modules.set(moduleName, module);
        }
    }

    #loadModule(moduleName) {
        // Simulate loading a module; in practice, this would involve more complex logic
        const module = new Module(moduleName);
        module.load();
        return module;
    }

    addModule(moduleName) {
        if (!this.modules.has(moduleName)) {
            const module = this.#loadModule(moduleName);
            this.modules.set(moduleName, module);
        }
    }

    hasModule(moduleName) {
        return this.modules.has(moduleName);
    }

    getModule(moduleName) {
        return this.modules.get(moduleName);
    }
}

const guilds = new Map();

export function getGuild(guildId) {
    if (!guilds.has(guildId)) {
        const guild = new GuildWithModule({ guildId });
        guilds.set(guildId, guild);
    }
    return guilds.get(guildId);
}
