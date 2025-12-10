import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { default as sharp } from 'sharp';

import { moduleName } from '../__init__.js';
import { replyError, getModuleData, replyWithAttachments } from '../../../utils.js';
import { DICE_FILES, DICE_VALUES, mapImages, colorDie, NUMBER_SPACING, NUMBER_MAX_WIDTH, MAX_DICE_PER_LINE, BASE_COLOR } from '../common.js'
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
	const validArgs = analizeArguments(
		interaction.options.getInteger('dice'), 
		interaction.options.getInteger('dice-count'), 
		interaction.options.getInteger('special-dices'), 
		interaction.options.getInteger('bonus'), 
		config['playerConfig'][interaction.user.id]
	);

	if (!validArgs) {
		await replyError(interaction, 'Dice value should be at least 1. You can set a default value using /set-default-dice.');
		return;
	}

	// Defer reply if a lot of dices are rolled
	if (validArgs.diceValue > 50 && validArgs.diceCount >= 50) {
		await interaction.deferReply();

		const dump = await rollAndDump(validArgs.diceValue, validArgs.diceCount, validArgs.specialCount, validArgs.bonus, validArgs.defaultColor, validArgs.specialColor);

		await interaction.editReply({ content: dump.content, files: [dump.attachment]});
	}
	else {
		const dump = await rollAndDump(validArgs.diceValue, validArgs.diceCount, validArgs.specialCount, validArgs.bonus, validArgs.defaultColor, validArgs.specialColor);

		replyWithAttachments(interaction, dump.content, [dump.attachment]);
	}
};

export function analizeArguments(diceValue, diceCount, specialCount, bonus, playerConfig) {
	// Check if dice value is correct or if a default dice value exist
	if ((!diceValue || diceValue < 0) && (!playerConfig || !playerConfig.defaultValue)) {
		return null;
	}

	// Prioritize the given dice value if valid
	diceValue = (diceValue && diceValue > 0) ? diceValue : playerConfig.defaultValue;
	// Prioritize the given dice count if valid, else 1
	diceCount = (diceCount && diceCount > 0) ? diceCount : 1;
	// If playerconfig.defaultColor exist, use it. Else use base color
	const defaultColor = (playerConfig && playerConfig.defaultColor) ? playerConfig.defaultColor : BASE_COLOR;
	// Prioritize the given special number if valid. Else if playerconfig.specialCount exist, use it. Else 0

	if (!specialCount || specialCount < 0) {
		if (specialCount === 0) {}
		else if (playerConfig && playerConfig.specialCount) {
			specialCount = playerConfig.specialCount;
		}
		else {
			specialCount = 0;
		}
	}

	// If playerconfig.specialColor exist, use it. Else use base color
	const specialColor = (playerConfig && playerConfig.specialColor) ? playerConfig.specialColor : BASE_COLOR;
	bonus = bonus ? bonus : 0;

	return { diceValue, diceCount, specialCount, bonus, defaultColor, specialColor };
}
//#endregion COMMAND DEFINITION

export async function rollAndDump(diceValue, diceCount, specialCount, bonus, defaultColor, specialColor) {
	const results = rollDices(diceCount, diceValue);

	return await dumpResults(results, bonus, diceValue, defaultColor, specialCount, specialColor);
}

function rollDices(diceCount, diceValue) {
	const results = [];

	for (let i = 0; i < diceCount; i++) {
		results.push(Math.floor(Math.random() * diceValue) + 1);
	}
	return results;
}

async function dumpResults(results, bonus, diceValue, defaultColor, specialCount, specialColor) {
	const dumpConfig = config['dumpResultConfig'];

	let content = "";
	if (dumpConfig.listResults) { content += `Results : [${results.join(', ')}]\n`; }
	if (dumpConfig.totalValue) { content += `${(bonus == 0 ? '' : `Bonus : ${bonus} -`)} Total : ${results.reduce((a, b) => a + b, 0) + bonus}\n` }
	if (dumpConfig.aboveAverage) { content += `Above average : ${results.filter(result => result >= (diceValue+1) / 2).length}\n`; }

	let attachment = new AttachmentBuilder();
	if (dumpConfig.visualResults) {
		attachment = new AttachmentBuilder(await createDiceResult(results, diceValue, defaultColor, specialCount, specialColor), { name: 'dice_results.png' });
	}

	return { content, attachment };
}

//#region CREATE DICE IMAGE
async function createDiceResult(results, dieValue, defaultColor, specialCount, specialColor) {
	// Create the new numbers
	const numbers = await createNumbers(results, NUMBER_SPACING, NUMBER_MAX_WIDTH);

	// Select die type
	const die = selectDie(dieValue);

	// Create dice
	const dice = await createDice(die, results, numbers, defaultColor, specialCount, specialColor);

	// Create final image

    const width = dice[0].info.width * MAX_DICE_PER_LINE;
    const height = dice[0].info.height * (1 + Math.floor((results.length - 1) / MAX_DICE_PER_LINE));
	return await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(mapImages(dice, true, MAX_DICE_PER_LINE))
    .png().toBuffer();
}

async function createNumbers(results, spacing = 2, maxWidth = 150) {
	const numbers = new Map();

    for (const result of results) {
		if (!numbers.has(result)) {
			let image;
			// For single digit numbers, directly load the image
			if (result <= 9) {
				image = sharp(getModuleData(moduleName, 'numbers', result + '.png'));
			}
			// For multiple digit numbers, create the image
			else {
				const numberImages = await Promise.all(
            	    ('' + result).split('').map(async char => {
            	        const image = sharp(getModuleData(moduleName, 'numbers', char + '.png'));
            	        const info = await image.metadata();
            	        const data = await image.toBuffer();
            	        return { data, info };
            	    })
            	);

            	const width = numberImages.reduce((sum, img) => sum + img.info.width, 0) + spacing * (numberImages.length - 1);
            	const height = numberImages.reduce((max, img) => Math.max(max, img.info.height), 0);

            	const imageBuffer = sharp({
            	    create: {
            	        width,
            	        height,
            	        channels: 4,
            	        background: { r: 0, g: 0, b: 0, alpha: 0 },
            	    },
            	}).composite(mapImages(numberImages, true, 9,spacing)).png().toBuffer();

				image = sharp(await imageBuffer);
            	if (width > maxWidth) {
                	image = image.resize({width: maxWidth})
            	}
			}
			numbers.set(result, { data: await image.png().toBuffer(), info: await image.metadata()} );
		}
	}
	return numbers;
}

function selectDie(value) {
	let dieFile = DICE_FILES[0]

	for (let i = 1; i < DICE_VALUES.length; i++) {
		if (value >= DICE_VALUES[i]) {
			dieFile = DICE_FILES[i]
		}
		else { break; }
	}
	return dieFile;
}

async function createDice(die, results, numbers, defaultColor = BASE_COLOR, specialCount = 0, specialColor = BASE_COLOR) {
	// Create base die images
	let dieImage;
	let specialDieImage;
	if (specialCount < results.length) { // Do not color die if all are special
		dieImage = await colorDie(die, defaultColor, true);
	}
	if (specialCount > 0) { // Do not color special die if none are special
		specialDieImage = await colorDie(die, specialColor, true);
	}

	return await Promise.all(
		results.map(async (_, i) => {
			const image = sharp(i < specialCount ? specialDieImage.data : dieImage.data)
				.composite([
                	{
                    	input: numbers.get(results[i]).data,
                    	gravity: 'center'
            	    }
            	]);
			const info = await image.metadata();
			const data = await image.toBuffer();
			return { data, info };
		})
	);
}
//#endregion CREATE DICE IMAGE
