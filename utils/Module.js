import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


/// Constants
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __baseModule = "base";

export class Module {
    constructor(name, guildId) {
        this.name = name;
        this.guildId = guildId;
        this.config = {};
        this.logger = new Logger(name, guildId);
    }

    load() {
        this.logger.info(`Loading module: ${this.name}`);
    }

    /// File paths
    moduleFileToPath(...pathParts) {
        return join(__dirname, 'modules', this.name, ...pathParts);
    }

    getModuleData(...pathParts) {
        return this.moduleFileToPath('data', ...pathParts);
    }

    getModuleConfig(file) {
        return this.moduleFileToPath('config', file);
    }

    /// importing
    async filePathToUrl(...pathParts) {
        return pathToFileURL(this.moduleFileToPath(...pathParts));
    }
}
