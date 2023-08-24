const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('1A_to_2A')
		.setDescription('Fait passer tous les 1A en 2A'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};