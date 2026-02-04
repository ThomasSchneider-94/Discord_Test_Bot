import { Logger } from './Logger.js';

export class ModuleLogger extends Logger {
    constructor(guildId, guildName, moduleName) {
        super();
        this.guildId = guildId;
        this.guildName = guildName;
        this.moduleName = moduleName;
    }

    _log(level, color, message) {
        super._log(level, color, `${this.guildName} - ${this.moduleName}: ${message}`);
    }
}
