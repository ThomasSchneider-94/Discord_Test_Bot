import { SlashCommandBuilder } from 'discord.js';

import { rollAndDump } from './dice_roll.js';
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

	let i = 0;
	while (i < args.length && (/^[0-9]$/.test(args[i]))) {
		i++;
	}
	const diceCount = Number(args.substring(0, i));

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
	const diceValue = values[0];
	const bonus = values[1];
	const specialCount = values[2];

	const playerConfig = config['playerConfig'][interaction.user.id];
		
	//Check if dice value is correct or if a default dice value exist and if the number of dice given is positive
	if (!((diceValue && diceValue >= 0) || (playerConfig && playerConfig.defaultValue)) || (diceCount && diceCount < 1)) {
		await replyError(interaction, 'Dice value should be at least 1. You can set a default value using /set-default-dice. Number of dice must be at least 1.');
		return;
	}

	// Defer reply if a lot of dices are rolled
	if (diceValue > 50 && diceCount >= 50) {
		await interaction.deferReply();

		const dump = await rollAndDump(diceValue, diceCount, specialCount, bonus, playerConfig);

		await interaction.editReply({ content: dump.content, files: [dump.attachment]});
	}
	else {
		const dump = await rollAndDump(diceValue, diceCount, specialCount, bonus, playerConfig);

		replyWithAttachments(interaction, dump.content, [dump.attachment]);
	}
};
