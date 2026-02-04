import { SlashCommandBuilder } from 'discord.js';

import { guildQueues } from '../guildQueue.js'
import { Jukebox } from '../Jukebox.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('jb')
	.setDescription('Jukebox actions')
    .addStringOption(option =>
		option.setName('action')
			.setDescription('Jukebox action')
            .setRequired(true)
            .addChoices(
				{ name: 'Play', value: 'play' },
				{ name: 'Pause', value: 'pause' },
				{ name: 'Stop', value: 'stop' },
				{ name: 'Skip', value: 'skip' },
				{ name: 'Play again', value: 'play-again' },
				{ name: 'Loop', value: 'loop' },
				{ name: 'Now playing', value: 'now-playing' },
				{ name: 'List', value: 'list' },
			));
	

export const execute = async (module, interaction) => {
	module.action(interaction);
};
//#endregion COMMAND DEFINITION

