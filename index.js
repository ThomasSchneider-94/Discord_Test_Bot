import { readdirSync } from 'fs';
import { join } from 'path';
import { Client, Collection, GatewayIntentBits, Partials, Events } from 'discord.js';
import { importFromModuleFile, __dirname } from './utils.js';
import { configFiles, addConfigFile } from './config.js';

// Create a new client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction
	],
});
client.commands = new Collection();

// Get all modules
const modules = readdirSync(join(__dirname, 'modules'));

const loadModules = async () => {
	for (const module of modules) {
		console.log(`[INFO] Loading module: ${module}`);

		const { configs: configFiles, events: eventFiles, commands: commandFiles } = await importFromModuleFile(module, '__init__.js');

		if (configFiles) {
			for(const configFile of configFiles) {
				addConfigFile(module, configFile);
			}
		}

		if (eventFiles) {
			for(const eventFile of eventFiles) {
				addEvent(await importFromModuleFile(module, eventFile));
			}
		}

		if (commandFiles) {
			for(const commandFile of commandFiles) {
				addCommand(await importFromModuleFile(module, commandFile));
			}
		}
	}
}

function addEvent(event) {
	if (event.once === undefined || event.name === undefined || event.execute === undefined) {
		console.log(`[ERROR] The event at ${event.filePath} is missing a required "once", "name" or "execute" property.`);
		return;
	}

	console.log(`[INFO] | Loading event ${event.name}`);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

function addCommand(command) {
	// Set a new item in the Collection with the key as the command name and the value as the exported module

	if (command.data === undefined || command.execute === undefined) {
		console.log(`[WARNING] The command at ${command.filePath} is missing a required "data" or "execute" property.`);
		return;
	}

	console.log(`[INFO] | Loading command ${command.data.name}`);

	client.commands.set(command.data.name, command);
}

await loadModules();

// Login
const { token } = configFiles.generalConfig;
client.login(token)
