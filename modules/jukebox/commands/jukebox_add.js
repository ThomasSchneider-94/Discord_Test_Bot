import { SlashCommandBuilder } from 'discord.js';

import { replyError } from '../../../utils.js';
import { connect } from './jukebox_connect.js';
import { GuildQueue, guildQueues } from '../guildQueue.js'
import { YtDlp } from "ytdlp-nodejs";

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
            replyError(interaction, 'You are currently not in a voice channel');
            return;
        }

        queue = new GuildQueue(connection);
        guildQueues.set(interaction.guild.id, queue);
    }

    const ytdlp = new YtDlp();
    await interaction.deferReply();

    const jsonString = await ytdlp._executeAsync(
        [url, "--dump-single-json"]
    );
    const info = JSON.parse(jsonString);
    const title = info.fulltitle || info.title || url;

    queue.enqueue({ url, title });

    await interaction.editReply(`🎵 Added to queue: **[${title}](<${url}>)**`);
};
//#endregion COMMAND DEFINITION
