import { join } from 'path';
import { readdirSync, writeFileSync } from 'fs';

import { importFile } from '#utils'
import { MODULES_DIR, __manifestFile } from '#paths'
import { create } from 'domain';
import { error } from 'console';

async function createReadMe(moduleName) {
    const manifestFile = join(MODULES_DIR, moduleName, __manifestFile)
    const { manifest } = await importFile(manifestFile);
    if (!manifest) {
        console.log(`\x1b[31mERROR\x1b[0m module ${moduleName} manifest ${manifestFile} does not exist`);
        return;
    }

    const content = createReadMeContent(manifest);
    if (!content) { return; }

    const file = join(MODULES_DIR, moduleName, 'README.md');
    writeFileSync(file, content, 'utf8');
    console.log(`\x1b[32mSUCCESS\x1b[0m Updated README file for module ${moduleName}: ${file}`);
}

function createReadMeContent(manifest) {
    if (!manifest.name || !manifest.displayName || !manifest.description) { 
        console.log(`\x1b[31mERROR\x1b[0m Manifest of module ${moduleName} is missing data. Name:${manifest.name} | Display name:${manifest.displayName} | Description:${manifest.description}`);
        return;
    }

    let readme = `# ${manifest.displayName}\n\n${manifest.description}`;

    if (manifest.commands) {
        readme += `\n\n## Commands`;

        for (const command of manifest.commands) {
            if (!validateCommand(command, manifest.name)) { continue; }
            readme += `\n\n- **/${command.name}**\n  ${command.description}\n${command.args.map(arg => `  - \`${arg.name}\`: ${arg.description}`).join('\n')}`;
        }
    }
    if (manifest.features) {
        readme += `\n\n## Features\n\n${manifest.features}`;
    }

    return readme + '\n';
}

function validateCommand(command, moduleName) {
    if (!command.name || !command.description) { 
        console.log(`\x1b[33mWARNING\x1b[0m Command ${command.name} of module ${moduleName} is missing a name or description.`);
        return false; }
    
    for (const arg of command.args) {
        if (!arg.name || !arg.description) {
            console.log(`\x1b[33mWARNING\x1b[0m Argument ${arg.name} of command ${command.name} of module ${moduleName} is missing a name or description.`);
            return false;
        }
    }
    
    return true;
}

for (const moduleName of readdirSync(MODULES_DIR)) {
    try {
        await createReadMe(moduleName);
    }
    catch {
        console.log(`\x1b[31mERROR\x1b[0m Serious error while rendering manifest of module ${moduleName}: ${error}`);
    }
}