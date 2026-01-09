import { env } from "process";
import { CLI_ARGS } from "./CLI_ARGS.js";
import { Moddy } from '#moddy/Moddy.js';
import { LogLevel } from '#moddy/models/LogLevel.js'

//#region CLI Arguments Handling
export async function handleCLIArgs(availableArgs, argv) {
	const args = argv.filter(arg => arg.startsWith('-'));

	for (const arg of args) {
		if (!availableArgs.some(argData => argData.names.includes(arg.split('=')[0]))) {
			logger.fatal(`Invalid argument: ${arg}. Use --help or -h to see the list of valid arguments.`);
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
					logger.fatal(`Please provide a ${argData.parameters} after ${arg}`);
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
const args = await handleCLIArgs(CLI_ARGS, process.argv);

/// Adjust the log level
export function getLogLevel(level) {
	let newLevel;

	if (/^\d+$/.test(level)) {
		newLevel = Number(level);
	}
	else {
		newLevel = LogLevel[level.toUpperCase()];
	}

	return newLevel;
}

/// Initialize the core module
const moddy = new Moddy()
moddy.init(
	args["--log-level"] ? getLogLevel(args["--log-level"]) : undefined,
	args["--modules"] ? args["--modules"].split(',') : []
);
export { moddy as env };
