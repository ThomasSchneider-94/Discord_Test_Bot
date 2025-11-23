import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { config, addConfigFile } from './config.js';
import { __dirname, __baseModule, importFromModuleFile, logInfo, logWarning } from './utils.js';

// Grab all the command folders from the commands directory you created earlier
const { configs } = await importFromModuleFile(__baseModule, '__init__.js');
if (configs) {
    for(const configFile of configs) {
        addConfigFile(__baseModule, configFile);
    }
}
else {
    logWarning("No configuration files found in base module");
}

const { token, clientId, guildId } = config.secretConfig;
const commands = [];

// Grab all the command files
const modules = readdirSync(join(__dirname, 'modules'));

for (const module of modules) {
    logInfo(`Updating module commands : ${module}`);

    const { commands: commandFiles } = await importFromModuleFile(module, '__init__.js');

    if (commandFiles) {
        for(const commandFile of commandFiles) {
            const command = await importFromModuleFile(module, 'commands', commandFile);

            if (command.data === undefined || command.execute === undefined) {
                logWarning(`The command at ${command.filePath} is missing a required "data" or "execute" property.`);
		        continue;
            }

            logInfo(`| Updating command : ${command.data.name}`);
            commands.push(command.data.toJSON());
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

(async () => {
	try {
		logInfo(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		logInfo(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		logError(error);
	}
})();