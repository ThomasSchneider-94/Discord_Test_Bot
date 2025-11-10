import { SlashCommandBuilder } from 'discord.js';

import { rollDices, dumpResults } from './dice_roll.js';

export const data = new SlashCommandBuilder()
	.setName('froll')
	.setDescription('Rolls multiple dices')
	.addStringOption(option =>
		option.setName('args')
			.setDescription('[Number of dice]d[Type of dice]+[Bonus] (e.g. 2d6+1 rolls 2 6-sided dice and adds 1 to the total)')
			.setRequired(true))

export const execute = async (interaction) => {
	const args = interaction.options.getString('args');
	let numberOfDice = args.includes('d') ? Number(args.split('d')[0]) : 1;
	const bonus = args.includes('+') ? Number(args.split('+')[1]) : 0;
	// If no d is present, assume it's a single dice roll with the given type
	let diceValue = args.includes('d') || args.includes('+') ? Number(args.split('+')[0].split('d')[1]) : Number(args);

	({ numberOfDice, diceValue } = (0, 0));
	const results = rollDices(numberOfDice, diceValue);
	await interaction.reply(dumpResults(results, bonus));
};
