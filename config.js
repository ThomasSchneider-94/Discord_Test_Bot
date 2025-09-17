import { readFileSync } from 'fs';
import { join, basename } from 'path';
import { __dirname } from './utils.js';

export const configFiles = {};

export function addConfigFile(module, file) {
    const key = basename(file, '.json');
    var fullPath = join(__dirname, 'modules', module, file);

    configFiles[key] = JSON.parse(readFileSync(fullPath, 'utf-8'));
    //console.log(`Configuration file "${join(module, file)}" added`)
}

// TODO : reaload only one
export function reloadConfig() {
	for (const file of configFiles) {
		const key = basename(file, '.json');
		const fullPath = join(configDir, file);
		configFiles[key] = JSON.parse(readFileSync(fullPath, 'utf-8'));
	}
}