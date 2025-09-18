import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

/// Constants
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __baseModule = "base";


/// Module file handling
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


/// Logging functions
export async function logError(message) {
	console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
}

export async function logWarning(message) {
	console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`);
}

export async function logInfo(message) {
	console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
}
