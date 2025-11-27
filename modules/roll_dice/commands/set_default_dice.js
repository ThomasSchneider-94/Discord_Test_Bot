import { SlashCommandBuilder, AttachmentBuilder, MessageFlags } from 'discord.js';
import { default as sharp } from 'sharp';

import { hexToRgb, replyError, replyWithAttachments, autocompleteArguments } from '../../../utils.js';
import { savePlayerConfig, mapImages, colorDie, DICE_FILES } from '../common.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('set-default-dice')
	.setDescription('Set default color and value of your dices')
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Default color of the dice')
            .setAutocomplete(true))
    .addIntegerOption(option =>
        option.setName('value')
            .setDescription('Default value of the dice'));

export const autocomplete = async (interaction) => {
	autocompleteArguments(interaction, Object.keys(AUTO_COMPLETE_COLOR_HEX));
};

export const execute = async (interaction) => {
    const value = interaction.options.getInteger('value');
    const hexColor = getHexaColor(interaction.options.getString('color'));

    if (!(value && value > 0) && !hexColor) {
        await replyError(interaction, 'Please provide a positive default value or default hexa color for the dice.');
        return;
    }

    if (value && value > 0 && !hexColor) {
        savePlayerConfig(interaction.user.id, { defaultValue: value });
        await interaction.reply({ content: `✅ Default dice value set to **${value}**.`, flags: MessageFlags.Ephemeral });
    }
    else {
        const attachment = new AttachmentBuilder(await showDiceSet(hexColor), { name: 'dice_set.png' });

        if (value && value >= 0) {
            savePlayerConfig(interaction.user.id, { defaultValue: value, defaultColor: hexColor });
            await replyWithAttachments(interaction, `✅ Default dice value set to **${value}** and color set to **` + interaction.options.getString('color') + '**!', [attachment], true);
        }
        else {
            savePlayerConfig(interaction.user.id, { defaultColor: hexColor });
            await replyWithAttachments(interaction, '✅ Default dice color set to **' + interaction.options.getString('color') + '**!', [attachment], true);
        }       
    }
}
//#endregion COMMAND DEFINITION

//#region COLORS
const AUTO_COMPLETE_COLOR_HEX = {
    'black': '#000000',
    'grey': '#808080',
    'white': '#ffffff',
    'red': '#ff0000',
    'orange': '#ff7f00',
    'yellow': '#ffff00',
    'light green': '#7fff00',
    'green': '#00ff00',
    'light blue': '#00ffff',
    'cyan': '#007fff',
    'blue': '#0000ff',
    'purple': '#7f00ff',
    'pink': '#ff00ff'
};

export function getHexaColor(color) {
    if (!color) { return false; }
    for (const [name, hex] of Object.entries(AUTO_COMPLETE_COLOR_HEX)) {
        if (name.toLowerCase() === color.toLowerCase()) {
            return hex;
        }
    }

    if (/^#[0-9a-f]{6}$/i.test(color)) {
        return color.toLowerCase();
    }
    return false;
}
//#endregion COLORS

export async function showDiceSet(hexColor) {
    // Create a preview image of the dice set
    const RgbColor = hexToRgb(hexColor);
    const diceSet = [];    

    for (const die of DICE_FILES) {
        diceSet.push(await colorDie(die, RgbColor));
    }

    const width = diceSet.reduce((sum, img) => sum + img.info.width, 0);
    const height = diceSet.reduce((max, img) => Math.max(max, img.info.height), 0);

    return await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(mapImages(diceSet, true, DICE_FILES.length))
    .png().toBuffer(); 
}
