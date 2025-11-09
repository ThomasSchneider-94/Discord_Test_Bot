import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';

import { moduleName } from '../__init__.js';
import { logInfo, getModuleData, hexToRgb, replyError, replyWithAttachments, autocompleteArguments } from '../../../utils.js';
import { autoCompleteColorNames, getHexaColor, savePlayerConfig, diceFiles } from '../common.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('dice-color')
	.setDescription('Set the color of your dices')
    .addStringOption(option =>
        option.setName('color')
            .setDescription('Color of the dice')
            .setAutocomplete(true)
            .setRequired(true));

export const autocomplete = async (interaction) => {
	autocompleteArguments(interaction, autoCompleteColorNames);
};

export const execute = async (interaction) => {
    const hexColor = getHexaColor(interaction.options.getString('color'));

    if (!hexColor) {
        await replyError(interaction, 'Invalid color! Please provide a valid hex color code or choose from the autocomplete options.');
        return;
    }

    savePlayerConfig(interaction.user.id, { diceColor: hexColor });

    const diceSet = await createDiceSet(hexColor, true);
    const attachment = new AttachmentBuilder(diceSet, { name: 'dice_set.png' });
    await replyWithAttachments(interaction, '✅ Color set to **' + interaction.options.getString('color') + '**!', [attachment]);
}
//#endregion COMMAND DEFINITION

//#region CREATE DICE SET
export async function createDiceSet(hexColor, setReturn = false) {
    const RgbColor = hexToRgb(hexColor);
    
    if (readdirSync(getModuleData(moduleName, 'dice_colored')).includes(hexColor)) {
        logInfo(`Found dice set for color ${hexColor}`);
    }
    else {
        logInfo(`Creating new dice set for color ${hexColor}`);

        mkdirSync(getModuleData(moduleName, 'dice_colored', hexColor), { recursive: true });

        for (const dice of diceFiles) {
            const { data, info } = await sharp(getModuleData(moduleName, 'dice_model', dice))
                                            .raw().ensureAlpha().toBuffer({ resolveWithObject: true });

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255 && data[i + 3] == 255) {
                    data[i] = RgbColor.r;
                    data[i + 1] = RgbColor.g;
                    data[i + 2] = RgbColor.b;
                }
            }

            await sharp(data, { raw: info })
                .toFile(getModuleData(moduleName, 'dice_colored', hexColor, dice));
        }
    }

    if (setReturn) {
        return showDiceSet(hexColor);
    }
}

async function showDiceSet(hexColor) {
    // Load all dice images with the specified color
    const dices = await Promise.all(
        diceFiles.map(async dice => {
            const image = sharp(getModuleData(moduleName, 'dice_colored', hexColor, dice));
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
    }).composite(
        dices.map((img, i) => ({
            input: img.data,
            top: 0,
            left: i * img.info.width,
        }))
    ).png().toBuffer();
}
//#endregion CREATE DICE SET AND REPLY
