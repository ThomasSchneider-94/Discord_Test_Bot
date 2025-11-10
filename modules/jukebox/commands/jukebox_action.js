import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import sharp from 'sharp';
import { readdirSync } from 'fs';

import { moduleName } from '../__init__.js';
import { replyError, getModuleData, logInfo, replyWithAttachments } from '../../../utils.js';
import { DICE_FILES, DICE_VALUES, mapImagesHorizontaly, NUMBER_SPACING, NUMBER_MAX_WIDTH, MAX_DICE_PER_LINE, BASE_COLOR_DIRECTORY } from '../common.js'
import { config } from '../../../config.js'

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('jb')
	.setDescription('Activate the jukebox')
    .addStringOption(option =>
		option.setName('action')
			.setDescription('Type of dice to roll')
            .setRequired(true)
            .addChoices(
				{ name: 'Start', value: 'start' },
				{ name: 'Play', value: 'play' },
				{ name: 'Pause', value: 'pause' },
				{ name: 'Add', value: 'add' },
				{ name: 'Stop', value: 'stop' },
				{ name: 'Skip', value: 'skip' },
			),);

export const execute = async (interaction) => {};
//#endregion COMMAND DEFINITION
