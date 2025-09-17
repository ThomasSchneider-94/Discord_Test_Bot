import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls a dice');

export const execute = async (interaction) => {
	await interaction.reply('You rolled a ' + (Math.floor(Math.random() * 6) + 1));
};