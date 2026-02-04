
import { join } from 'path';
import { readdirSync } from 'fs';

import { Module } from '../../models/Module.js';
import { data } from './__manifest__.js';
import { importFromPath, MODULES_DIR } from '../../utils/paths.js';

export class Base extends Module {
    constructor(guildId, guildName) {
        super(guildId, guildName, data.name);

        this.modules = new Map();
    }

    async init() {
        await super.init(data);

        for (const moduleName of this.configs['modules'].installedModules || []) {
            try {
                /// Create an instance of the Module class
                const moduleInstance = await this.loadModuleClass(moduleName);
                this.modules.set(moduleName, moduleInstance);
            } catch (error) {
                this.logger.error(`${error}`);
            }
        }

        return this;
    }

    async loadModuleClass(moduleName) {
        const modulePath = join(MODULES_DIR, moduleName);
        const classFile = readdirSync(modulePath).filter(f => f.endsWith('.js') && f !== '__manifest__.js');

        if (classFile.length === 0) { throw new Error(`No class file found for module "${moduleName}"`); }
        else if (classFile.length > 1) { throw new Error(`Multiple class files found for module "${moduleName}"`); }

        const ModuleClass = (await importFromPath(join(modulePath, classFile[0]))).default;

        if (!ModuleClass) { throw new Error(`Class "${moduleName}" not found in ${modulePath}`); }

        const moduleInstance = new ModuleClass(this.guildId, this.guildName);
        await moduleInstance.init();

        return moduleInstance;
    }
}
