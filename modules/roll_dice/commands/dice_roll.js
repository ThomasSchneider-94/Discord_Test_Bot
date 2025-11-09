import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';

import { moduleName } from '../__init__.js';
import { moduleFileToPath, replyError } from '../../../utils.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls a dice')
	.addIntegerOption(option =>
		option.setName('dice')
			.setDescription('Type of dice to roll')
			.setRequired(true))
	.addIntegerOption(option =>
		option.setName('number-of-dice')
			.setDescription('Number of dice to roll'))
	.addIntegerOption(option =>
		option.setName('bonus')
			.setDescription('Bonus to add to the total roll'));

export const execute = async (interaction) => {
	const diceValue = interaction.options.getInteger('dice');
	const numberOfDice = interaction.options.getInteger('number-of-dice') || 1;
	const bonus = interaction.options.getInteger('bonus') || 0;

	if (checkConstraints(numberOfDice, diceValue)) {
		await replyError(interaction, 'Number of dice and dice value must be at least 1.');
		return;
	}

	const results = rollDices(numberOfDice, diceValue);

	const attachment = new AttachmentBuilder(moduleFileToPath(moduleName, 'data', 'blank', 'd4.png'));
	await interaction.reply({
		content: dumpResults(results, bonus),
		files: [attachment]
	});
};

export function checkConstraints(numberOfDice, diceValue) {
	return numberOfDice < 1 && diceValue < 1;
}

export function rollDices(numberOfDice, diceValue) {
	const results = [];
	for (let i = 0; i < numberOfDice; i++) {
		results.push(Math.floor(Math.random() * diceValue) + 1);
	}
	return results;
}

export function dumpResults(results, bonus) {
	return `Results : [${results.join(', ')}]\n` + 
			(bonus == 0 ? '' : `Bonus : ${bonus} - `) + 
			`Total : ${results.reduce((a, b) => a + b, 0) + bonus}`
}
