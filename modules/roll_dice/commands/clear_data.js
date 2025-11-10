import { SlashCommandBuilder } from 'discord.js';
import { readdirSync, rm } from 'fs';

import { config } from '../../../config.js';
import { moduleName } from '../__init__.js';
import { logInfo, getModuleData } from '../../../utils.js';
import { BASE_COLOR_DIRECTORY } from '../common.js'

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('clear-data')
	.setDescription('Clear the data files of the Roll Dice module');

export const execute = async (interaction) => {
    const dices = Object.values(config['playerConfig']).map(config => config.defaultColor);
    const speDices = Object.values(config['playerConfig']).map(config => config.specialColor);
    const colors =[...dices, ...speDices];

    for (const directory of readdirSync(getModuleData(moduleName, 'dices'))) {
        if (directory != BASE_COLOR_DIRECTORY && !colors.includes(directory)) {
            await rm(getModuleData(moduleName, 'dices', directory), 
                        { recursive: true },
                        err => {
                            if (err) {
                                throw err;
                            }
                            logInfo(`Dice set for color ${directory} not used anymore. Deleted successfully.`);
                        }
                    );
        }
    }

    await interaction.reply('✅ Unused data files cleared.');
};
//#endregion COMMAND DEFINITION
