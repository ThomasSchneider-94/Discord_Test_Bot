import { dirname, resolve  } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const __baseModule = 'base';

export const ROOT_DIR = resolve(__dirname, '..');
export const MODULES_DIR = resolve(ROOT_DIR, 'modules');
export const BASE_MODULE_DIR = resolve(MODULES_DIR, __baseModule);

export async function importFromPath(path) {
    return await import(pathToFileURL(path));
}

export async function importManifestFile(moduleName) {
    if (!moduleName || !existsSync(join(MODULES_DIR, moduleName, '__manifest__.js'))) {
        return { data: null };
    }

    return await importFromPath(join(MODULES_DIR, moduleName, '__manifest__.js'));
}
