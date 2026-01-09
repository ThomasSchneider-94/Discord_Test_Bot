import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls dice')
	.addIntegerOption(option =>
		option.setName('dice')
			.setDescription('Type of dice to roll'))
	.addIntegerOption(option =>
		option.setName('count')
			.setDescription('Number of dice to roll'))
	.addIntegerOption(option =>
		option.setName('modifier')
			.setDescription('Modifier to apply to the total roll'))
	.addStringOption(option =>
		option.setName('color')
			.setDescription('Color of the dice')
      		.setAutocomplete(true));

export const autocomplete = "colorNames";
