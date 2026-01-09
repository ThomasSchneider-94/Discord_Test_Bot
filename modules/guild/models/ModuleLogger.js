import { Logger } from '../../../moddy/models/Logger.js'
import { defaultLogLevel } from '../../../moddy/configs/logLevelConfigs.js'

export class ModuleLogger extends Logger {
    constructor(moduleName, guildName, logLevel = defaultLogLevel) {
        super(`${moduleName} [${guildName}]`, logLevel);
    }
}
