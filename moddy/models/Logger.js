import { createWriteStream } from 'fs'

import { LogLevel } from "./LogLevel.js";
import { logLevelConfigs, defaultLogLevel } from '../configs/logLevelConfigs.js'
import { LOG_FILE } from "#paths";

const logStream = createWriteStream(LOG_FILE, { flags: "a" });

export class Logger {
    constructor(moduleName, logLevel = defaultLogLevel) {
        this.logLevel = logLevel;
        this.moduleName = moduleName;
    }

    setLevel(logLevel) {
        if (!Object.values(LogLevel).includes(logLevel)) { return; }
        this.logLevel = logLevel;
    }

    _log(level, message) {
        if (level > this.logLevel) { return; }

        const logConfig = logLevelConfigs[level];
        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

        console.log(`${timestamp} \x1b[${logConfig.color}m${logConfig.label}\x1b[0m ${this.moduleName} - - ${message}`);

        logStream.write(`${timestamp} [${logConfig.label}] ${message}\n`);
    }

    fatal(message)   { this._log(LogLevel.FATAL, message); }
    error(message)   { this._log(LogLevel.ERROR, message); }
    warning(message) { this._log(LogLevel.WARNING, message); }
    info(message)    { this._log(LogLevel.INFO, message); }
    debug(message)   { this._log(LogLevel.DEBUG, message); }
}
