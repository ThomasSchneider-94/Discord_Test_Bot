import { SlashCommandBuilder } from 'discord.js';

import { analizeArguments, rollAndDump } from './dice_roll.js';
import { replyError, replyWithAttachments } from '../../../utils.js';
import { config } from '../../../config.js'

export const data = new SlashCommandBuilder()
	.setName('froll')
	.setDescription('Rolls multiple dices')
	.addStringOption(option =>
		option.setName('args')
			.setDescription('[Dice count]d[Dice value]+[Bonus] [Special dice count]')
			.setRequired(true))

export const execute = async (interaction) => {
	const args = interaction.options.getString('args');

	const initiators = ['d', '+', ' '];
	const values = [null, null, null];	

	// Get values for each initiator (d: dice value, +: bonus, ' ': special dice count)
	for (let i = 0; i < initiators.length; i++) {
		for (let j = 0; j < args.length; j++) {
			if (args[j] == initiators[i]) {
				let k = j+1;
				while (k < args.length && (/^[0-9]$/.test(args[k]))) {
					k++;
				}
				values[i] = Number(args.substring(j+1, k));
				break;
			}
		}
	}

	// Get dice count (first number to appears)
	let i = 0;
	while (i < args.length && (/^[0-9]$/.test(args[i]))) {
		i++;
	}

	const validArgs = analizeArguments(
		values[0], // dice value
		Number(args.substring(0, i)), // dice count
		values[2],  // special dice count
		values[1], // bonus
		config['playerConfig'][interaction.user.id]
	);
	
	if (!validArgs) {
		await replyError(interaction, 'Dice value should be at least 1. You can set a default value using /set-default-dice.');
		return;
	}

	const dump = await rollAndDump(validArgs.diceValue, validArgs.diceCount, validArgs.specialCount, validArgs.bonus, validArgs.defaultColor, validArgs.specialColor);

	await replyWithAttachments(interaction, dump.content, [dump.attachment]);
};
