import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Display module or command description')
	.addStringOption(option =>
		option.setName('module')
			.setDescription('Get module description')
			.setAutocomplete(true)
			)
    .addStringOption(option =>
		option.setName('command')
			.setDescription('Get command description')
			.setAutocomplete(true)
			);

export const autocomplete = {
	"module": "allModules",
 	"command": {
		function: "commandByModule",
		args: ["module"]
	}
};
