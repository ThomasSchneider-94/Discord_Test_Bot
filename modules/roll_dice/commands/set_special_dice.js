import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';

import { replyError, replyWithAttachments, autocompleteArguments } from '../../../utils.js';
import { createDiceSet } from './set_dice_color.js';
import { autoCompleteColorNames, savePlayerConfig, getHexaColor } from '../common.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('special-dice')
	.setDescription('Set the number and color of your special dices')
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Color of the dice')
            .setAutocomplete(true))
    .addIntegerOption(option =>
        option.setName('number')
            .setDescription('Number of special dices to roll'));

export const autocomplete = async (interaction) => {
    await autocompleteArguments(interaction, autoCompleteColorNames);
};

export const execute = async (interaction) => {
    const number = interaction.options.getInteger('number');
    const hexColor = getHexaColor(interaction.options.getString('color'));

    if (!(number && number >= 0) && !hexColor) {
        await replyError(interaction, 'Please provide a positive number or color for the special dice.');
        return;
    }

    if (number && number >= 0 && !hexColor) {
        savePlayerConfig(interaction.user.id, { specialDiceNumber: number });
        await interaction.reply(`✅ Special dice number set to **${number}**.`);
    }
    else {
        const diceSet = await createDiceSet(hexColor, true);
        const attachment = new AttachmentBuilder(diceSet, { name: 'dice_set.png' });

        if (number && number >= 0) {
            savePlayerConfig(interaction.user.id, { specialDiceNumber: number, specialDiceColor: hexColor });
            await replyWithAttachments(interaction, `✅ Special dice number set to **${number}** and color set to **` + interaction.options.getString('color') + '**!', [attachment]);
        }
        else {
            savePlayerConfig(interaction.user.id, { specialDiceColor: hexColor });
            await replyWithAttachments(interaction, '✅ Special dice color set to **' + interaction.options.getString('color') + '**!', [attachment]);
        }       
    }
};
//#endregion COMMAND DEFINITION
