import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __baseModule = "base";

export function moduleFileToPath(module, file) {
	return join(__dirname, 'modules', module, file);
}

export function moduleFileToUrl(module, file) {
	return pathToFileURL(moduleFileToPath(module, file));
}

export async function importFromModuleFile(module, file) {
	return await import(moduleFileToUrl(module, file));
}

export async function importFromPath(filePath) {
	return await import(pathToFileURL(filePath));
}
