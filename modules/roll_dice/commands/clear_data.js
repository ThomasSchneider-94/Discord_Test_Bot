import { SlashCommandBuilder } from 'discord.js';
import { readdirSync, rm } from 'fs';

import { config } from '../../../config.js';
import { moduleName } from '../__init__.js';
import { logInfo, getModuleData } from '../../../utils.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('clear-data')
	.setDescription('Clear the data files of the Roll Dice module');

export const execute = async (interaction) => {
    const dices = Object.values(config['playerConfig']).map(config => config.diceColor);
    const speDices = Object.values(config['playerConfig']).map(config => config.specialDiceColor);
    const colors =[...dices, ...speDices];

    for (const folder of readdirSync(getModuleData(moduleName, 'dice_colored'))) {
        if (!colors.includes(folder)) {
            await rm(getModuleData(moduleName, 'dice_colored', folder), 
                        { recursive: true },
                        err => {
                            if (err) {
                                throw err;
                            }
                            logInfo(`Dice set for color ${folder} not used anymore. Deleted successfully.`);
                        }
                    );
        }
    }

    await interaction.reply('✅ Unused data files cleared.');
};
//#endregion COMMAND DEFINITION
