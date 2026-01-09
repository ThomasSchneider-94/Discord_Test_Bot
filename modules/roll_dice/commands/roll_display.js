import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('roll-display')
	.setDescription('Set the display parameters when rolling dice')
    .addBooleanOption(option =>
        option.setName('list')
            .setDescription('Return the list of results'))
    .addBooleanOption(option =>
        option.setName('success')
            .setDescription('Return the total value of the dices'))
    .addBooleanOption(option =>
        option.setName('visual')
            .setDescription('Return an image with all dices'));
