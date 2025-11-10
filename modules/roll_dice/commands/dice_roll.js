import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import sharp from 'sharp';
import { readdirSync } from 'fs';

import { moduleName } from '../__init__.js';
import { replyError, getModuleData, logInfo, replyWithAttachments } from '../../../utils.js';
import { DICE_FILES, DICE_VALUES, mapImagesHorizontaly, NUMBER_SPACING, NUMBER_MAX_WIDTH, MAX_DICE_PER_LINE, BASE_COLOR_DIRECTORY } from '../common.js'
import { config } from '../../../config.js'

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Rolls dices')
	.addIntegerOption(option =>
		option.setName('dice')
			.setDescription('Type of dice to roll'))
	.addIntegerOption(option =>
		option.setName('dice-count')
			.setDescription('Number of dice to roll'))
	.addIntegerOption(option =>
		option.setName('bonus')
			.setDescription('Bonus to add to the total roll'))
	.addIntegerOption(option =>
		option.setName('special-dices')
			.setDescription('Number of special dices'));

export const execute = async (interaction) => {
	let diceValue = interaction.options.getInteger('dice');
	const diceCount = interaction.options.getInteger('dice-count') || 1;
	
	const playerConfig = config['playerConfig'][interaction.user.id];
	
	// Check if dice value is correct or if a default dice value exist and if the number of dice given is positive
	if (!((diceValue && diceValue >= 0) || (playerConfig && playerConfig.defaultValue)) || diceCount < 1) {
		await replyError(interaction, 'Dice value should be at least 1. You can set a default value using /set-default-dice. Number of dice must be at least 1.');
		return;
	}
	
	// Prioterize the given dice value if valid
	diceValue = (diceValue && diceValue >= 0) ? diceValue : playerConfig.defaultValue; 
	// If playerconfig.defaultColor exist, use it. Else use base color
	const defaultColor = (playerConfig && playerConfig.defaultColor) ? playerConfig.defaultColor : BASE_COLOR_DIRECTORY;
	// Prioterize the given special number if valid. Else if playerconfig.specialCount exist, use it. Else 0
	let specialCount = interaction.options.getInteger('special-dices');
	if (!(specialCount && specialCount >= 0)) {
		if (playerConfig && playerConfig.specialCount) { specialCount = playerConfig.specialCount; }
		else { specialCount = 0; }
	}
	// If playerconfig.specialColor exist, use it. Else use base color
	const specialColor = (playerConfig && playerConfig.specialColor) ? playerConfig.specialColor : BASE_COLOR_DIRECTORY;
	const bonus = interaction.options.getInteger('bonus') || 0;

	const results = rollDices(diceCount, diceValue);

	const dump = await dumpResults(results, bonus, diceValue, defaultColor, specialCount, specialColor);

	await replyWithAttachments(interaction, dump.content, [dump.attachment]);
	};
//#endregion COMMAND DEFINITION

export function rollDices(diceCount, diceValue) {
	const results = [];

	for (let i = 0; i < diceCount; i++) {
		results.push(Math.floor(Math.random() * diceValue) + 1);
	}
	return results;
}

export async function dumpResults(results, bonus, diceValue, defaultColor, specialCount, specialColor) {
	const dumpConfig = config['dumpResultConfig'];

	let content = "";
	if (dumpConfig.listResults) { content += `Results : [${results.join(', ')}]\n`; }
	if (dumpConfig.totalValue) { content += `${(bonus == 0 ? '' : `Bonus : ${bonus} -`)} Total : ${results.reduce((a, b) => a + b, 0) + bonus}\n` }
	if (dumpConfig.aboveAverage) { content += `Above average : ${results.filter(result => result >= diceValue / 2).length}\n`; }

	let attachment = new AttachmentBuilder();
	if (dumpConfig.visualResults) {
		attachment = new AttachmentBuilder(await createDiceResult(results, diceValue, defaultColor, specialCount, specialColor), { name: 'dice_results.png' });
	}

	return { content, attachment };
}

//#region CREATE DICE IMAGE
async function createDiceResult(results, diceValue, defaultColor, specialCount, specialColor) {
	// Create the new numbers
	await createNumbers(results, NUMBER_SPACING, NUMBER_MAX_WIDTH);

	// Select dice type and colors
	const dice = selectDice(diceValue);
	const colors = results.map((_, i) => i < specialCount ? specialColor : defaultColor);
	
	// Create dices
	const dices = await createDices(dice, colors, results);

	// Create final image
    const width = dices[0].info.width * MAX_DICE_PER_LINE;
    const height = dices[0].info.height * (1 + Math.floor((results.length - 1) / MAX_DICE_PER_LINE));

	return await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(mapImages(dices))
    .png().toBuffer();
} 

async function createNumbers(results, spacing = 2, maxWidth = 150) {
    const exitingNumbers = readdirSync(getModuleData(moduleName, 'numbers'));

    for (const result of results) {
        if (!exitingNumbers.includes(result + '.png')) {
            logInfo(`Creating new number file for ${result}`);

            const numbers = await Promise.all(
                ('' + result).split('').map(async char => {
                    const image = sharp(getModuleData(moduleName, 'numbers', char + '.png'));
                    const info = await image.metadata();
                    const data = await image.toBuffer();
                    return { data, info };
                })
            );

            const width = numbers.reduce((sum, img) => sum + img.info.width, 0) + spacing * (numbers.length - 1);
            const height = numbers.reduce((max, img) => Math.max(max, img.info.height), 0);

            const imageBuffer = await sharp({
                create: {
                    width,
                    height,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                },
            }).composite(mapImagesHorizontaly(numbers, spacing)).png().toBuffer();

            let image = sharp(imageBuffer);
            if (width > maxWidth) {
                image = image.resize({width: maxWidth})
            }

            await image.toFile(getModuleData(moduleName, 'numbers', result + '.png'));
            exitingNumbers.push(`${result}.png`)
        }
    }
}

function selectDice(value) {
	let diceFile = DICE_FILES[0]

	for (let i = 1; i < DICE_VALUES.length; i++) {
		if (value >= DICE_VALUES[i]) {
			diceFile = DICE_FILES[i]
		}
		else { break; }
	}
	return diceFile;
}

async function createDices(dice, colors, results) {
	const dices = await Promise.all(
		colors.map(async (_, i) => {
			const image = sharp(getModuleData(moduleName, 'dices', colors[i], dice))
				.composite([
                	{
                    	input: getModuleData(moduleName, 'numbers', results[i] + '.png'),
                    	gravity: 'center'
            	    }
            	]);
			const info = await image.metadata();
			const data = await image.toBuffer();
			return { data, info };
		})
	);
	return dices;
}

function mapImages(images, spacing = 0) {
    let offsetX = 0;
    let offsetY = 0;

    return images.map((img, i) => {
        const layer = {
            input: img.data,
            top: offsetY,
            left: offsetX
        };
        offsetX += (img.info.width + spacing);

		if (i == MAX_DICE_PER_LINE - 1) {
			offsetX = 0;
			offsetY += img.info.height;
		}
		
        return layer;
    });
}
//#endregion CREATE DICE IMAGE
