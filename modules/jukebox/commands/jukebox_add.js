import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('jb-add')
	.setDescription('Add a music to the queue')
	.addStringOption(option =>
		option.setName('url')
			.setDescription('Youtube url')
            .setRequired(true));
