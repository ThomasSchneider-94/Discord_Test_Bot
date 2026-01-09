import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('module')
	.setDescription('Manage the module on your server')
	.addStringOption(option =>
		option.setName('action')
			.setDescription('Module action')
            .setRequired(true)
            .addChoices(
				{ name: 'Add', value: 'add' },
				{ name: 'Remove', value: 'remove' }
			))
    .addStringOption(option =>
		option.setName('module')
			.setDescription('Module to add')
            .setRequired(true)
			.setAutocomplete(true)
			);

export const autocomplete = { function: "autocompleteModule", args: ["action"] };
