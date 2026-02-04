import { SlashCommandBuilder } from 'discord.js';

import { moduleName } from '../__init__.js';
import { config, writeConfig } from '../../../config.js'

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('configure-results')
	.setDescription('Set return parameters')
    .addBooleanOption(option =>
        option.setName('list-results')
            .setDescription('Return the list of results'))
    .addBooleanOption(option =>
        option.setName('total-value')
            .setDescription('Return the total sum of dices'))
    .addBooleanOption(option =>
        option.setName('above-average')
            .setDescription('Return the number of above average dice'))
    .addBooleanOption(option =>
        option.setName('visual-results')
            .setDescription('Return a image with all dices'));

export const execute = async (interaction) => {
    const listResults = interaction.options.getBoolean('list-results');
    const totalValue = interaction.options.getBoolean('total-value');
    const aboveAverage = interaction.options.getBoolean('above-average');
    const visualResults = interaction.options.getBoolean('visual-results');

    const current = config['dumpResultConfig'];

    config['dumpResultConfig'] = {  listResults: listResults != null ? listResults : current.listResults,
                                    totalValue: totalValue != null ? totalValue : current.totalValue,
                                    aboveAverage: aboveAverage != null ? aboveAverage : current.aboveAverage,
                                    visualResults: visualResults != null ? visualResults : current.visualResults
    };
    writeConfig(moduleName, 'dumpResultConfig');

    interaction.reply(`New result mode - **List**:  ${config['dumpResultConfig'].listResults ? '✅' : '❌'} **Total** :  ${config['dumpResultConfig'].totalValue ? '✅' : '❌'} **Above average** :  ${config['dumpResultConfig'].aboveAverage ? '✅' : '❌'} **Visual** :  ${config['dumpResultConfig'].visualResults ? '✅' : '❌'}.`)
}
