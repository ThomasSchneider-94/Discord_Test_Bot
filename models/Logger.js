export class Logger {    
    info(message) {
        this._log("INFO", "32", message);
    }
    
    warning(message) {
        this._log("WARNING", "33", message);
    }
    
    error(message) {
        this._log("ERROR", "31", message);
    }
    
    debug(message) {
        this._log("DEBUG", "34", message);
    }
    
    _log(level, color, message) {
        console.log(`${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')} \x1b[${color}m[${level}]\x1b[0m ${message}`);
    }
}

export const logger = new Logger();
