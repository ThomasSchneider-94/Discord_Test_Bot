import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';

import { replyError, replyWithAttachments, autocompleteArguments } from '../../../utils.js';
import { createDiceSet } from './set_default_dice.js';
import { AUTO_COMPLETE_COLOR_NAMES, savePlayerConfig, getHexaColor } from '../common.js';

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
    await autocompleteArguments(interaction, AUTO_COMPLETE_COLOR_NAMES);
};

export const execute = async (interaction) => {
    const count = interaction.options.getInteger('count');
    const hexColor = getHexaColor(interaction.options.getString('color'));

    if (!(count && count >= 0) && !hexColor) {
        await replyError(interaction, 'Please provide a positive number or color for the special dice.');
        return;
    }

    if (count && count >= 0 && !hexColor) {
        savePlayerConfig(interaction.user.id, { specialCount: count });
        await interaction.reply({ content: `✅ Special dice count set to **${count}**.`, ephemeral: true });
    }
    else {
        const diceSet = await createDiceSet(hexColor, true);
        const attachment = new AttachmentBuilder(diceSet, { name: 'dice_set.png' });

        if (count && count >= 0) {
            savePlayerConfig(interaction.user.id, { specialCount: count, specialColor: hexColor });
            await replyWithAttachments(interaction, `✅ Special dice count set to **${count}** and color set to **` + interaction.options.getString('color') + '**!', [attachment], true);
        }
        else {
            savePlayerConfig(interaction.user.id, { specialColor: hexColor });
            await replyWithAttachments(interaction, '✅ Special dice color set to **' + interaction.options.getString('color') + '**!', [attachment], true);
        }       
    }
};
//#endregion COMMAND DEFINITION
