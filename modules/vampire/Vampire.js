import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';

import { RollDice } from '#modules/roll_dice/RollDice.js';
import { manifest } from './__manifest__.js';

import { Cache } from '#utils';
import { HEX_COLOR_MAP, hexToRgb, getHexaColor } from '#utils/colors.js'
import { loadImage, loadImages, render, overlayOnBackground, concatImageHoryzontal, concatImageVertically, replaceColor } from '#utils/imageManipulation.js'
import { LogLevel } from '#root/moddy/models/LogLevel.js';

const DICE_CACHE = new Cache(20);

export default class Vampire extends RollDice {
	constructor(guildId, guildName) {
		super(manifest, guildId, guildName);

        this._vampireSettingsConfigKey = 'vampireSettings';
        this._baseHungerColor = HEX_COLOR_MAP['red'];
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

	async set_hunger(interaction, count, color, normalColor) {
		// TODO
    }
	//#endregion Commands

    createDiceGroup(dice, count, color, hunger, hungerColor, playerConfig) {
        if (!dice || dice < 0) { dice = 10; }
        playerConfig = playerConfig || {};
        
        const group = super.createDiceGroup(dice, count, color, playerConfig);

        group.hunger = (hunger && hunger >= 0) ? hunger : playerConfig.hunger;
        const hungerColor = getHexaColor(hungerColor);
        group.hungerColor = hungerColor ? hungerColor : (playerConfig.hungerColor ? playerConfig.hungerColor : this._baseHungerColor);
    
        return group;
    }

    //#region Text display
    getSuccessDisplay(results, modifier, diceGroups) {
        if (diceGroups.all(group => group.dice === 10)) {
            const successes = results.flat().filter(result => result > 5);
            const tens = successes.count(success => success === 10);
            
            return `Successes: ${successes.length + Math.round(tens/2)}`
        }
        else {
            return super.getSuccessDisplay(results, modifier);
        }
    }
    //#endregion Text display

    //#region Visual display
    async createDiceGroupItems(diceGroup, results, numbers) {
        // Select die type
        const diceFile = this.getDataFile(this.selectDieFile(diceGroup.dice));
        
        // Create the base colored dice
        const hungerDice = await this.colorDice(diceFile, diceGroup.hungerColor);
        const coloredDice = await this.colorDice(diceFile, diceGroup.color);

        const tmp = await overlayOnBackground(hungerDice, results.slice(0, diceGroup.hunger).map(result => numbers.get(result)));
        return tmp.concat(await overlayOnBackground(hungerDice, results.slice(diceGroup.hunger, results.length - diceGroup.hunger).map(result => numbers.get(result))));
    }
    //#endregion Visual display
}
