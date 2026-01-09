import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('froll')
	.setDescription('Rolls multiple dices')
	.addStringOption(option =>
		option.setName('args')
			.setDescription('[Die count]d[Die value]. Repeatable spareated by blanck space. Add modifier with +/-.')
			.setRequired(true))
