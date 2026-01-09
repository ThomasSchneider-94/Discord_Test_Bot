import { REST, Routes } from 'discord.js';
import { readFileSync } from 'fs';
import { join } from 'path';

import { MODULES_DIR, __configsDir } from '#paths'

const { core } = JSON.parse(readFileSync(join(MODULES_DIR, 'core', __configsDir, 'secretConfig.js'), 'utf-8'));
const rest = new REST().setToken(core.token);
await rest.put(
    Routes.applicationCommands(core.clientId),
    { body: [] }
);
