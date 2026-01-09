import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('set-dice')
	.setDescription('Set default color and value of your dices')
    .addIntegerOption(option =>
        option.setName('value')
            .setDescription('Default value of the dice'))
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Default color of the dice')
            .setAutocomplete(true));

export const autocomplete = "colorNames";
