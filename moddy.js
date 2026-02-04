import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readFileSync, readdirSync } from 'fs';

import { CLI_args } from "./CLI_args.js";
import { logger } from "./models/Logger.js";
import { MODULES_DIR } from './utils/paths.js';

//#region CLI Arguments Handling
export async function handleCLIArgs(availableArgs, argv) {
	const args = argv.filter(arg => arg.startsWith('-'));

	for (const arg of args) {
		if (!availableArgs.some(argData => argData.names.includes(arg.split('=')[0]))) {
			logger.error(`Invalid argument: ${arg}. Use --help or -h to see the list of valid arguments.`);
			process.exit(1);
		}
	}

	return await processCLIArgs(argv, availableArgs);
}

async function processCLIArgs(argv, availableArgs) {
	const args = argv.map((arg, index) => ({ arg: arg, followingArg: argv[index + 1] || null })).filter(arg => arg.arg.startsWith('-'));
	const runArgs = {};

	for (const arg of args) {
		const argData = availableArgs.find(argData => argData.names.includes(arg.arg.split('=')[0]));

		if (argData) {
			runArgs[argData.names[0]] = await processCLIArg(arg.arg, argData, arg.followingArg);
		}
	}
	return runArgs;
}

async function processCLIArg(arg, argData, followingArg) {
	// If the argument is a runArg, store its value
	if (argData.runArg) {
		// If the argument requires parameters, get its value
		if (argData.parameters) {
			if (arg.includes('=')) { // --arg=value format
				return arg.split('=')[1];
			}
			else { // --arg value format
				if (!followingArg) {
					logger.error(`Please provide a ${argData.parameters} after ${arg}`);
					process.exit(1);
				}
				return followingArg;
			}
		}
		else {
			return true;
		}
	}
	// else, execute the argument immediately
	else {

		await argData.execute();
		process.exit(0);
	}
}
//#endregion CLI Arguments Handling

/// Process command line arguments
const args = await handleCLIArgs(CLI_args, process.argv);

/// Create a new Client
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

//// Login
const { token } = JSON.parse(readFileSync("./secretConfig.json", 'utf-8'));
client.login(token)

/// Retrieve all guilds
import { Base } from './modules/base/Base.js';
const guilds = await client.guilds.fetch();
const baseModuleInstances = new Map();

/// Loads modules for each guild
for (const guild of guilds.values()) {
	console.log(guild.id, guild.name);
	const baseModule = new Base(guild.id, guild.name);

	// Initialize the base module with all its sub-modules
	await baseModule.init();
	baseModuleInstances.set(guild.id, baseModule);
}



















//#region Register all commands and events
function registerCommandsAndEvents() {
	for (const moduleName of readdirSync(MODULES_DIR)) {}
		





}















//#endregion Register all commands and events



















































// import { pathToFileURL } from 'url';
// import { join } from 'path';
// import { MODULES_DIR } from './utils/paths.js';

// const { data } = await importManifestFile('jukebox');
// // console.log(data);
// // console.log(data.commands[0]);
// // console.log(join(MODULES_DIR, 'jukebox', 'commands', data.commands[0]));

// const command = await import(pathToFileURL(join(MODULES_DIR, 'jukebox', 'commands', data.commands[0])));

// command.data.options.forEach(element => {
// 	console.log(element.name);
// });


// export const execute = async (module, interaction) => {
// 	module.action(interaction);
// };



// import { Jukebox } from './modules/jukebox/Jukebox.js';

// const jukebox = new Jukebox('jukebox', 'test-guild-id');
// var commandName = command.data.name;

// if (commandName in jukebox && typeof jukebox[commandName] === 'function') {
// 	jukebox[commandName]('test-interaction', 'test-action');
// }











// /// Create base modules
// console.log('Test');
// client.guilds.cache.forEach(guild => {
// 	console.log('Guild:');
// 	console.log(`${guild.name} | ${guild.id}`);
// })
















// Register commands
// function registerCommand(moduleName, command) {
// 	// Set a new item in the Collection with the key as the command name and the value as the exported module

// 	if (command.data === undefined || command.execute === undefined) {
// 		logWarning(`The command at ${command.filePath} is missing a required "data" or "execute" property.`);
// 		return;
// 	}

// 	logInfo(`| Loading command ${command.data.name}`);
// 	command.data.moduleName = moduleName;

// 	client.commands.set(command.data.name, command);
// }

// function registerEvent(moduleName, event) {
// 	if (event.once === undefined || event.name === undefined || event.execute === undefined) {
// 		logError(`The event at ${event.filePath} is missing a required "once", "name" or "execute" property.`);
// 		return;
// 	}

// 	logInfo(`| Loading event ${event.name}`);
// 	event.moduleName = moduleName;

// 	if (event.once) {
// 		client.once(event.name, (...args) => event.execute(...args, client));
// 	} else {
// 		client.on(event.name, (...args) => event.execute(...args, client));
// 	}
// }


