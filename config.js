import { readFileSync } from 'fs';
import { basename } from 'path';
import { writeFileSync } from 'fs';

import { __dirname, getModuleConfig, logInfo } from './utils.js';

const configs = {};

export function addConfigFile(module, file) {
    const key = basename(file, '.json');
    configs[key] = JSON.parse(readFileSync(getModuleConfig(module, file), 'utf-8'));
    //logInfo(`Configuration file "${join(module, file)}" added`)
}

export function updateConfig(moduleName, configKey, key, updateValue, write = false) {
    const currentConfig = config[configKey];

    currentConfig[key] = { ...currentConfig[key], ...updateValue };
    config[configKey] = currentConfig;

    if (write) {
      writeConfig(moduleName, configKey);
    }
}

export function writeConfig(module, key) {
	getModuleConfig(module, key + '.json');
	writeFileSync(getModuleConfig(module, key + '.json'), JSON.stringify(configs[key]), 'utf8');
}

export const config = new Proxy({}, {
    get(_, key) {
        return configs[key];
    },
    set(_, key, value) {
        configs[key] = value;
        return true;
    },
    has(_, key) {
        return key in configs;
    },
});