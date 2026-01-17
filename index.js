import { readdirSync } from 'fs';
import { join } from 'path';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';

import { importFromModuleFile, __dirname, __baseModule, logError, logWarning, logInfo } from './utils.js';
import { config, addConfigFile } from './config.js';

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
	let dump = "Available modules:\n"

	for (const module of modules.filter(m => m != __baseModule)) {
		const { moduleName } = await importFromModuleFile(module, '__init__.js');

		if (moduleName) {
			dump += ` - ${module}\n`
		}
	}
	console.log(dump);
	process.exit(0);
}
//#endregion Command Line Arguments
















// Create a new client
const client = new Client({
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
		
		const { moduleName, configs: configFiles, events: eventFiles, commands: commandFiles } = await importFromModuleFile(module, '__init__.js');

		if (!moduleName) {
			logWarning(`Module ${module} is missing a moduleName export in its __init__.js`);
			continue;
		}
		logInfo(`Loading module: ${moduleName}`);

		if (configFiles) {
			for(const configFile of configFiles) {
				addConfigFile(moduleName, configFile);
			}
		}

		if (eventFiles) {
			for(const eventFile of eventFiles) {
				addEvent(await importFromModuleFile(module, 'events', eventFile));
			}
		}

		if (commandFiles) {
			for(const commandFile of commandFiles) {
				addCommand(await importFromModuleFile(module, 'commands', commandFile));
			}
		}
	}
}



await loadModules();


