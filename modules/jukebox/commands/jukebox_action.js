import { SlashCommandBuilder } from 'discord.js';

import { replyError } from '../../../utils.js';
import { guildQueues } from '../guildQueue.js'

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
				{ name: 'Loop', value: 'loop' },
				{ name: 'Now playing', value: 'now-playing' },
				{ name: 'List', value: 'list' },
			));

export const execute = async (interaction) => {
	const action = interaction.options.getString('action');

	const queue = guildQueues.get(interaction.guild.id);

	if (!queue) {
		replyError(interaction, 'Their is currently no jukebox');
		return;
	}

	switch (action) {
		case 'play':
			queue.resume();
            interaction.reply("▶️ Play");
			break;
		case 'pause':
			queue.pause();
            interaction.reply("⏸ Paused");
			break;
		case 'stop':
			queue.stop();
            interaction.reply("⏹ Stopped music and cleared queue");
			break;
		case 'skip':
			queue.skip();
			interaction.reply("⏭ Skipped current song. Now playing : " + queue.getCurrent());
			break;
		case 'loop':
			const loopState = queue.changeLoop();
			interaction.reply(loopState ? "🔁 Loop enabled" : "🔁 Loop disabled");
			break;
		case 'now-playing':
			interaction.reply("🎵 Now playing : " + queue.getCurrent());
			break;
		case 'list':
			interaction.reply("🎵 Now playing : " + queue.getCurrent() + "\n Playlist :\n" + queue.getQueue());
			break;
		default:
			replyError(interaction, 'Unknown action');
			break;
	}
};
//#endregion COMMAND DEFINITION

