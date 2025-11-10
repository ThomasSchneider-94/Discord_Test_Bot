import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';

import { moduleName } from '../__init__.js';
import { logInfo, getModuleData, hexToRgb, replyError, replyWithAttachments, autocompleteArguments } from '../../../utils.js';
import { AUTO_COMPLETE_COLOR_NAMES, getHexaColor, savePlayerConfig, DICE_FILES, mapImagesHorizontaly, BASE_COLOR_DIRECTORY } from '../common.js';

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
	autocompleteArguments(interaction, AUTO_COMPLETE_COLOR_NAMES);
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
        await interaction.reply(`✅ Default dice value set to **${value}**.`);
    }
    else {
        const diceSet = await createDiceSet(hexColor, true);
        const attachment = new AttachmentBuilder(diceSet, { name: 'dice_set.png' });

        if (value && value >= 0) {
            savePlayerConfig(interaction.user.id, { defaultValue: value, defaultColor: hexColor });
            await replyWithAttachments(interaction, `✅ Default dice value set to **${value}** and color set to **` + interaction.options.getString('color') + '**!', [attachment]);
        }
        else {
            savePlayerConfig(interaction.user.id, { defaultColor: hexColor });
            await replyWithAttachments(interaction, '✅ Default dice color set to **' + interaction.options.getString('color') + '**!', [attachment]);
        }       
    }
}
//#endregion COMMAND DEFINITION

//#region CREATE DICE SET
export async function createDiceSet(hexColor, setReturn = false) {
    const RgbColor = hexToRgb(hexColor);
    
    if (readdirSync(getModuleData(moduleName, 'dices')).includes(hexColor)) {
        logInfo(`Found dice set for color ${hexColor}`);
    }
    else {
        logInfo(`Creating new dice set for color ${hexColor}`);

        mkdirSync(getModuleData(moduleName, 'dices', hexColor), { recursive: true });

        for (const dice of DICE_FILES) {
            const { data, info } = await sharp(getModuleData(moduleName, 'dices', BASE_COLOR_DIRECTORY, dice))
                                            .raw().ensureAlpha().toBuffer({ resolveWithObject: true });

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255 && data[i + 3] == 255) {
                    data[i] = RgbColor.r;
                    data[i + 1] = RgbColor.g;
                    data[i + 2] = RgbColor.b;
                }
            }

            await sharp(data, { raw: info })
                .toFile(getModuleData(moduleName, 'dices', hexColor, dice));
        }
    }

    if (setReturn) {
        return showDiceSet(hexColor);
    }
}

async function showDiceSet(hexColor) {
    // Load all dice images with the specified color
    const dices = await Promise.all(
        DICE_FILES.map(async dice => {
            const image = sharp(getModuleData(moduleName, 'dices', hexColor, dice));
            const info = await image.metadata();
            const data = await image.toBuffer();
            return { data, info };
        })
    );

    const width = dices.reduce((sum, img) => sum + img.info.width, 0);
    const height = dices.reduce((max, img) => Math.max(max, img.info.height), 0);

    return await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(mapImagesHorizontaly(dices))
    .png().toBuffer();
}
//#endregion CREATE DICE SET AND REPLY
