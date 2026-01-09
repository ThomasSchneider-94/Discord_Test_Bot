import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


/// Constants
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __baseModule = "base";

/// Module file handling
export function moduleFileToPath(module, ...pathParts) {
	return join(__dirname, 'modules', module, ...pathParts);
}

export function moduleFileToUrl(module, ...pathParts) {
	return pathToFileURL(moduleFileToPath(module, ...pathParts));
}

export async function importFromModuleFile(module, ...pathParts) {
	return await import(moduleFileToUrl(module, ...pathParts));
}

export async function importFromPath(filePath) {
	return await import(pathToFileURL(filePath));
}

/// Get file or folder from module
export function getModuleData(module, ...fileOrFolder) {
	return join(__dirname, 'modules', module, 'data', ...fileOrFolder);
}

export function getModuleConfig(module, file) {
	return join(__dirname, 'modules', module, 'config', file);
}

/// Images
export function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
	r: (bigint >> 16) & 255,
	g: (bigint >> 8) & 255,
	b: bigint & 255,
  };
}

export function rgbToHex(rgb) {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

/// Command reply helpers



/// Logger
export async function logError(message) {
	console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
}

export async function logWarning(message) {
	console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`);
}

export async function logInfo(message) {
	console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
}