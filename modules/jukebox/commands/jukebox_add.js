import { SlashCommandBuilder } from 'discord.js';

import { connect } from './jukebox_connect.js';
import { GuildQueue, guildQueues } from '../guildQueue.js'

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('jb-add')
	.setDescription('Add a music to the queue')
	.addStringOption(option =>
		option.setName('url')
			.setDescription('Youtube url')
            .setRequired(true));

export const execute = async (interaction) => {
	const url = interaction.options.getString('url');

    let queue = guildQueues.get(interaction.guild.id);

    if (!queue) {
        // Join voice channel
        const connection = connect(interaction.guild, interaction.member.voice.channel, null);
        if (!connection) {
		    interaction.replyError('You are currently not in a voice channel');
            return;
        }

        queue = new GuildQueue(connection);
        guildQueues.set(interaction.guild.id, queue);
    }

    const song_url = queue.enqueue(url);

    if (song_url) {
        interaction.reply(`🎵 Added to queue: ${song_url}`);
    }
    else {
		interaction.replyError('Failed to add to queue');
    }
}
//#endregion COMMAND DEFINITION
