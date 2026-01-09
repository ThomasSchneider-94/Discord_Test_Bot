import { SlashCommandBuilder, ChannelType  } from 'discord.js';

//#region COMMAND DEFINITION
export const data = new SlashCommandBuilder()
	.setName('jb-connect')
	.setDescription('Activate the jukebox')
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('Voice channel')
			.addChannelTypes(ChannelType.GuildVoice));
