import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls a dice')
	.addIntegerOption(option =>
		option.setName('dice')
			.setDescription('Max value of the dice'))
	.addBooleanOption(option =>
		option.setName('ephemeral')
			.setDescription('Whether or not the echo should be ephemeral'));

export const execute = async (interaction) => {
	//console.log(interaction);
	//diceValue = interaction.options.getInteger('dice');
	await interaction.reply('You rolled a ' + (Math.floor(Math.random() * 6) + 1));
};