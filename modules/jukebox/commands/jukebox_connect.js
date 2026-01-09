import { SlashCommandBuilder, ChannelType  } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

import { GuildQueue, guildQueues } from '../guildQueue.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('jb-connect')
	.setDescription('Activate the jukebox')
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('Voice channel')
			.addChannelTypes(ChannelType.GuildVoice));

export const execute = async (interaction) => {
    const channel = interaction.options.getChannel('channel');

    if (!connect(interaction.guild, channel, interaction.member.voice.channel)) {
		interaction.replyError('Specify a voice channel or be in a voice channel');
        return;
    }
	
    interaction.reply("🎵 Connection successfull !");
};
//#endregion COMMAND DEFINITION

export function connect(guild, channel, memberVocalChannel) {
    const channelId = selectChannelId(guild.id, channel, memberVocalChannel);

    if (!channelId) { return null; }

	const connection = joinVoiceChannel({
    	channelId: channelId,
    	guildId: guild.id,
    	adapterCreator: guild.voiceAdapterCreator
    });

    const queue = guildQueues.get(guild.id);
    if (!queue) {
        guildQueues.set(guild.id, new GuildQueue(connection));
    }
    return connection;
}

function selectChannelId(guildId, channel, memberVocalChannel) {
    if (channel) { // If vocal is specified
		return channel.id;
	}
	else if (memberVocalChannel) { // If member in a vocal
		return memberVocalChannel.id
	}
	else {
        return null;
	}
}


