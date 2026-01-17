import { readdirSync } from 'fs';
import { join } from 'path';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

import { validateCommandLineArgs } from "./command_line_args.js";
import { logger } from "./utils/Logger.js";
import { importFromModuleFile, __dirname, __baseModule, logError, logWarning, logInfo } from './utils.js';

// Process command line arguments
const options = validateCommandLineArgs(process.argv);

// Create a new Client
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	],
});
client.commands = new Collection();

/// Login
import { token } from './base/config/secret_config.js';
client.login(token)

/// Create base modules
client.guilds.cache.forEach(guild => {
	console.log(`${guild.name} | ${guild.id}`);
})
















// Register commands
function registerCommand(moduleName, command) {
	// Set a new item in the Collection with the key as the command name and the value as the exported module

	if (command.data === undefined || command.execute === undefined) {
		logWarning(`The command at ${command.filePath} is missing a required "data" or "execute" property.`);
		return;
	}

	logInfo(`| Loading command ${command.data.name}`);
	command.data.moduleName = moduleName;

	client.commands.set(command.data.name, command);
}

function registerEvent(moduleName, event) {
	if (event.once === undefined || event.name === undefined || event.execute === undefined) {
		logError(`The event at ${event.filePath} is missing a required "once", "name" or "execute" property.`);
		return;
	}

	logInfo(`| Loading event ${event.name}`);
	event.moduleName = moduleName;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}


