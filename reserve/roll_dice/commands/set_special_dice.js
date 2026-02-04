import { SlashCommandBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';

import { savePlayerConfig } from '../common.js';
import { showDiceSet, getHexaColor, autocomplete as autocompleteColor } from './set_default_dice.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('set-special-dice')
	.setDescription('Set the number and color of your special dices')
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Color of the dice')
            .setAutocomplete(true))
    .addIntegerOption(option =>
        option.setName('count')
            .setDescription('Number of special dices to roll'));

export const autocomplete = async (interaction) => {
    await autocompleteColor(interaction);
};

export const execute = async (interaction) => {
    const count = interaction.options.getInteger('count');
    const hexColor = getHexaColor(interaction.options.getString('color'));

    if (!(count && count >= 0) && !hexColor) {
		interaction.replyError('Please provide a positive number or color for the special dice.');
        return;
    }

    let message = '';
    let attachment;

    if (count && count >= 0 && !hexColor) {
        savePlayerConfig(interaction.user.id, { specialCount: count });
        message = `✅ Special dice count set to **${count}**.`;
    }
    else {
        attachment = new AttachmentBuilder(await showDiceSet(hexColor), { name: 'dice_set.png' });

        if (count && count >= 0) {
            savePlayerConfig(interaction.user.id, { specialCount: count, specialColor: hexColor });
            message =  `✅ Special dice count set to **${count}** and color set to **` + interaction.options.getString('color') + '**!';
        }
        else {
            savePlayerConfig(interaction.user.id, { specialColor: hexColor });
            message = '✅ Special dice color set to **' + interaction.options.getString('color') + '**!';
        }

        await interaction.replyWithAttachments(
            message,
            [attachment],
            true
        );
    }
};
//#endregion COMMAND DEFINITION
