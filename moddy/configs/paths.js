import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const __coreDir = 'moddy'

export const __manifestFile = '__manifest__.js'
export const __configsDir = 'configs'
export const __commandsDir = 'commands'
export const __eventsDir = 'events'
export const __templatesDir = 'templates'
export const __dataDir = 'data'


export const ROOT_DIR = resolve(__dirname, '..', '..');
export const CORE_DIR = resolve(ROOT_DIR, __coreDir);
export const MODULES_DIR = resolve(ROOT_DIR, 'modules');
export const CONFIGS_DIR = resolve(ROOT_DIR, __configsDir);

export const LOG_FILE = resolve(ROOT_DIR, 'logs.txt');
