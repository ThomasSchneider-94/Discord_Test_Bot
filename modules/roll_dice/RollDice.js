import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';

import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';

import { Cache } from '#utils';
import { HEX_COLOR_MAP, hexToRgb, getHexaColor } from '#utils/colors.js'
import { loadImage, loadImages, render, overlayOnBackground, concatImageHoryzontal, concatImageVertically, replaceColor } from '#utils/imageManipulation.js'
import { LogLevel } from '#root/moddy/models/LogLevel.js';

const DICE_CACHE = new Cache(20);

export default class RollDice extends Module {
	constructor(guildId, guildName) {
		super(manifest, guildId, guildName);

        this._baseColor = HEX_COLOR_MAP['white'];
        this._numberSpacing = 2;
        this._numberMaxWidth = 150;
        this._diceValues = [4, 6, 8, 10, 12, 20];
        this._maxDicePerLine = 10;
        this._diceLineWidth = 180 * this._maxDicePerLine;
        this._resultDisplayConfigKey = 'resultDisplay';
        this._playerSettingsConfigKey = 'playerSettings';
	}

    async init(logLevel) {
        super.init(logLevel);

        if (Object.keys(this.configs[this._resultDisplayConfigKey]).length === 0) {
            this.configs[this._resultDisplayConfigKey] = { list: true, success: true, visual: false };
            this.writeConfig(this._resultDisplayConfigKey);
        }
    }

	//#region Commands

	//#region Roll
    async roll(interaction, dice, count, modifier, color) {
        const diceGroup = this.createDiceGroup(dice, count, color, this.configs[this._playerSettingsConfigKey][interaction.user.id]);
        
        if (!diceGroup) {
            return interaction.replyError('Dice value should be at least 1. You can set a default value using /set-dice.');
        }

        return await interaction.deferReplyAndGenerateResponse(
            () => this.rollAndDisplay([diceGroup], modifier ? modifier : 0)
        );
    }

	async froll(interaction, args) {
        // Get the modifier (bonus or malus)
        const MODIFIER_REGEX = /[+-]\d+/g;
        const modifierMatches = [...args.matchAll(MODIFIER_REGEX)];

        if (modifierMatches.length > 1) { return interaction.replyError('Please provide only one modifier.'); }
        let modifier = 0;
        if (modifierMatches.length === 1) {
            modifier = Number(modifierMatches[0][0]);
            args = args.replace(MODIFIER_REGEX, '').trim(); // Remove modifier from the args
        }

		const DICE_REGEX = /^(?=.*\d)(?:(\d+))?(?:d(\d+))?$/;
		const diceGroups = [];
		for (const arg of args.split(' ')) {
            let match;
            try {
			    match = arg.match(DICE_REGEX);
            }
            catch (error) {
                return interaction.replyError(`Invalid argument \`${arg.length > 10 ? arg.slice(0, 10) + '...' : arg}\`.\nArguments should be in format \`[count]d[dice]\`. Count is optional and will default to 1. Dice can be set by default using /set-dice.`);
            }
            const [, count, dice] = match;
			const diceGroup = this.createDiceGroup(Number(dice), Number(count), undefined, this.configs[this._playerSettingsConfigKey][interaction.user.id]);

			if (!diceGroup) {
				return interaction.replyError(`Dice value should be at least 1 for the argument \`${arg}\`. You can set a default value using /set-dice.`);
			}
			
			diceGroups.push(diceGroup);
		}

		return await interaction.deferReplyAndGenerateResponse(
            () => this.rollAndDisplay(diceGroups, modifier)
        );
	}

	// Autocomplete
	get colorNames() {
		return Object.keys(HEX_COLOR_MAP);
	}
	//#endregion Roll

	roll_display(interaction, list, success, visual) {
		const currentConfig = this.configs[this._resultDisplayConfigKey];
		const newConfig = {
			list: list != undefined ? list : currentConfig.list,
			success: success != undefined ? success : currentConfig.success,
			visual: visual != undefined ? visual : currentConfig.visual,
		}
		
		this.configs[this._resultDisplayConfigKey] = newConfig;
		this.writeConfig(this._resultDisplayConfigKey);

        if (!newConfig.list && !newConfig.success && !newConfig.visual) {
            return interaction.replyWarning("Modification applied. **The rolls won't display anything**. Not really usefull 🤔");
        }
        else {
            return interaction.reply(`Results display: List ${newConfig.list ? '✅' : '❌'} - Success ${newConfig.success ? '✅' : '❌'} - Visuals ${newConfig.visual ? '✅' : '❌'}`);
        }
	}

	async set_dice(interaction, value, color) {
		const hexColor = getHexaColor(color);

		if (!(value && value > 0) && !hexColor) {
        	return interaction.replyError('Please provide a positive value or default hexa color for the dice.');
    	}

		const currentConfig = this.configs[this._playerSettingsConfigKey][interaction.user.id] || {};
		this.configs[this._playerSettingsConfigKey][interaction.user.id] = {
			defaultDice: (value && value > 0) ? value : currentConfig.defaultDice,
			defaultColor: hexColor ? hexColor : currentConfig.defaultColor
		}
		this.writeConfig(this._playerSettingsConfigKey);

    	let attachment;
		if (hexColor) {
			attachment = new AttachmentBuilder(await this.createDiceSet(hexColor), { name: 'dice_set.png' });
		}

		await interaction.replySuccessWithAttachments(
			`${(value && value > 0) ? `Default dice value set to **${value}**${hexColor ? ' and c' : ''}` : 'C'}${hexColor ? `olor set to **${color}**` : ''} !`, 
			attachment ? [attachment] : [], 
			true
		);
    }
	//#endregion Commands

    createDiceGroup(dice, count, color, playerConfig) {
        playerConfig = playerConfig || {};

        // Check if dice value is correct or if a default dice value exist
        if ((!dice || dice < 0) && !playerConfig.defaultDice) {
            return null;
        }

        // Prioritize the given value if valid. Else if playerconfig exist, use it. Else default value
        dice = (dice && dice > 0) ? dice : playerConfig.defaultDice;
        count = (count && count > 0) ? count : 1;
		let hexColor = getHexaColor(color);
        hexColor = hexColor ? hexColor : (playerConfig.defaultColor ? playerConfig.defaultColor : this._baseColor);
    
        return { dice, count, color: hexColor };
    }

    async rollAndDisplay(diceGroups, modifier) {
        const results = [];
		for (const diceGroup of diceGroups) {
			results.push(this.rollDices(diceGroup.count, diceGroup.dice));
		}

        return this.displayResults(diceGroups, results, modifier);
        return { content, files: [attachment] };
    }

    rollDices(count, dice) {
	    const results = [];

	    for (let i = 0; i < count; i++) {
	    	results.push(Math.floor(Math.random() * dice) + 1);
	    }
	    return results;
    }

    async displayResults(diceGroups, results, modifier) {
        const resultDisplay = this.configs[this._resultDisplayConfigKey];
    
        let content = "";
        if (resultDisplay.list) { content += this.getListDisplay(diceGroups, results) + '\n'; }
        if (resultDisplay.success) { content += this.getSuccessDisplay(results, modifier) + '\n'; }
    
        let attachment = new AttachmentBuilder();
        if (resultDisplay.visual) {
            attachment = await this.getVisualDisplay(diceGroups, results);
        }

        return { content, files: [attachment] };
    }

    //#region Text display
    getListDisplay(diceGroups, results) {
        return `__Results__:${results.length === 1 
            ? ` [${results[0].join(', ')}]` 
            : `\n- ${results
                .map((resultList, i) => `D${diceGroups[i].dice} : [${resultList.join(', ')}]`)
                .join('\n- ')
            }`
        }`;
    }

    getSuccessDisplay(results, modifier) {
        const flatTotal = results.flat().reduce((total, result) => total + result, 0);
        const modifierDisplay = `${modifier > 0 ? '+' : ''}${modifier}`;

        return `${(modifier == 0 ? '' : `Modifier ${modifierDisplay} -`)} Total : ${flatTotal}${modifier == 0 ? '' : `${modifierDisplay}=${flatTotal + modifier}`}`;
    }
    //#endregion Text display

    //#region Visual display
    async getVisualDisplay(diceGroups, results) {
        // Create the numbers used on the dice
        const numbers = await this.createNumbers(results);

        let visuals = [];
        for (const i in diceGroups) {
            visuals = visuals.concat(await this.createDiceGroupItems(diceGroups[i], results[i], numbers));
        }

        const lines = [];
        for (let i = 0; i < visuals.length; i += this._maxDicePerLine) {
            lines.push(await concatImageHoryzontal(visuals.slice(i, i + this._maxDicePerLine), 0, undefined, this._diceLineWidth));
        }
        return await render(await concatImageVertically(lines));
    }

    async createNumbers(results, spacing = this.NUMBER_SPACING, maxWidth = this.NUMBER_MAX_WIDTH) {
        // Return a map with the image corresponding to the number
        const numbers = new Map();
        const numberFolder = 'numbers';
    
        for (const result of results.flat()) {
            if (!numbers.has(result)) {
                let image;
                // For single digit numbers, directly load the image
                if (result <= 9) {
                    numbers.set(result, await loadImage(this.getDataFile(numberFolder, `${result}.png`)));
                }
                // For multiple digit numbers, create the image
                else {
                    const images = await loadImages(String(result).split('').map(char => this.getDataFile(numberFolder, `${char}.png`)))
                    numbers.set(result, await concatImageHoryzontal(images, spacing, maxWidth) );
                }
            }
        }
        return numbers;
    }

    async createDiceGroupItems(diceGroup, results, numbers) {
        // Select die type
        const diceFile = this.getDataFile(this.selectDieFile(diceGroup.dice));
        
        // Create the base colored dice
        const coloredDice = await this.colorDice(diceFile, diceGroup.color);

        return await overlayOnBackground(coloredDice, results.map(result => numbers.get(result)));
    }

    async colorDice(diceFile, color, useCache=true) {
		// Take hexa color as argument    
        if (useCache && DICE_CACHE.has(`${diceFile}-${color}`)) {
            //this.logger.info(`Cache hit for ${diceFile}-${color}`);
            return DICE_CACHE.get(`${diceFile}-${color}`);
        }

        const coloredDice = await replaceColor(
            await loadImage(diceFile),
            hexToRgb(this._baseColor),
            hexToRgb(color)
        );

        if (useCache) {
            //this.logger.info(`Cache set for ${diceFile}-${color}`);
            DICE_CACHE.set(`${diceFile}-${color}`, coloredDice);
        }
    
        return coloredDice;
    }

    async createDiceSet(color) {
    	// Create a preview image of the dice set
    	const diceSet = [];    

    	for (const value of this._diceValues) {
			const diceFile = this.getDataFile(this.getDiceFile(value));
        	diceSet.push(await this.colorDice(diceFile, color, false));
    	}

		return await render(await concatImageHoryzontal(diceSet));
	}
    //#endregion Visual display

    selectDieFile(dice) {
        const nearestValueIndex = this._diceValues.findIndex(value => dice <= value) - 1;
        return this.getDiceFile(
			nearestValueIndex < 0
                ? nearestValueIndex === -1 ? this._diceValues[0] : this._diceValues[this._diceValues.length - 1]
                : this._diceValues[nearestValueIndex]
		);
    }

	getDiceFile(value) {
		return join('dice', `d${value}.png`);
	}
}
