import { readdirSync } from 'fs';
import { join } from 'path';
import { Client, Collection, GatewayIntentBits, Partials, Events } from 'discord.js';
import { importFromModuleFile, __dirname, __baseModule, logError, logWarning, logInfo } from './utils.js';
import { configFiles, addConfigFile } from './config.js';

/// Handle command line arguments
//#region Command Line Arguments
const str_options = "Usage: node index.js [options]\n" +
 		"--help, -h : Display help information\n" +
		"--modules, -m <module_name> : Load specific modules. Default : all modules\n" +
		"--list-modules, -l : List all available modules\n";

const valid_options = [
  "--help", "-h",
  "--modules", "-m",
  "--list-modules", "-l"
];

const options = process.argv.filter(arg => arg.startsWith('-'));
for (const option of options) {
	if (!valid_options.includes(option.split('=')[0])) {
		logError(`Invalid option: ${option}. Use --help or -h to see the list of valid options.`);
		process.exit(1);
	}
}

if (options.includes('--help') || options.includes('-h')) {
  	console.log(str_options);
  	process.exit(0);
}

if (options.includes('--list-modules') || options.includes('-l')) {
	const modules = readdirSync(join(__dirname, 'modules'));
	console.log("Available modules:");
	for (const module of modules.filter(m => m != __baseModule)) {
		console.log(` - ${module}`);
	}
	console.log("\n");
	process.exit(0);
}
//#endregion Command Line Arguments

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

/// Get modules
const availableModules = readdirSync(join(__dirname, 'modules'));
var modules = [__baseModule]; // Always load base module

// Check for specific modules to load
if (options.includes('--modules') || options.includes('-m')) {

	const index = process.argv.findIndex(arg => arg === '--modules' || arg === '-m');
	if (index === -1 || index === process.argv.length - 1) {
		logError("Please provide a module name after --modules or -m");
		process.exit(1);
	}

	const moduleNames = process.argv[index + 1].split(',');
	for (const moduleName of moduleNames) {
		if (availableModules.includes(moduleName)) {
			if (!modules.includes(moduleName)) {
				modules.push(moduleName);
			}
		}
		else {
			logWarning(`Module not found: ${moduleName}`);
		}
	}
}
else {
	modules = availableModules
}

/// Load modules
const loadModules = async () => {
	for (const module of modules) {
		logInfo(`Loading module: ${module}`);

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
		logError(`The event at ${event.filePath} is missing a required "once", "name" or "execute" property.`);
		return;
	}

	logInfo(`| Loading event ${event.name}`);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

function addCommand(command) {
	// Set a new item in the Collection with the key as the command name and the value as the exported module

	if (command.data === undefined || command.execute === undefined) {
		logWarning(`The command at ${command.filePath} is missing a required "data" or "execute" property.`);
		return;
	}

	logInfo(`| Loading command ${command.data.name}`);

	client.commands.set(command.data.name, command);
}

await loadModules();

/// Login
const { token } = configFiles.generalConfig;
client.login(token)
