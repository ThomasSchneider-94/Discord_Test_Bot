class Logger {    
    info(message) {
        this.#log("INFO", "32", message);
    }
    
    warning(message) {
        this.#log("WARNING", "33", message);
    }
    
    error(message) {
        this.#log("ERROR", "31", message);
    }
    
    debug(message) {
        this.#log("DEBUG", "34", message);
    }
    
    #log(level, color, message) {
        console.log(`\x1b[${color}m[${level}]\x1b[0m ${message}`);
    }
}

class ModuleLogger {
    constructor(moduleName, guildId) {
        this.moduleName = moduleName;
        this.guildId = guildId;
        const logger = new Logger();

        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return logger[prop];
            }
        });
    }
    
    #log(level, color, message) {
        console.log(`\x1b[${color}m[${level}]\x1b[0m ${this.guildId} ${this.moduleName}: ${message}`);
    }
}

export const baseLogger = new Logger();
