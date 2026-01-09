import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { resolve } from 'path';
import { execFile } from 'child_process';

import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';

import { MusicQueue } from './models/MusicQueue.js';
import { ROOT_DIR } from '#paths';

let ytDlpUpdateCooldownUntil = 0;
let ytDlpUpdateInProgress = false;
const ytDlpPath = resolve(ROOT_DIR, 'node_modules', 'ytdlp-nodejs', 'bin', 'yt-dlp.exe');

export default class Jukebox extends Module {
	constructor(guildId, guildName) {
		super(manifest, guildId, guildName);
	
		this.queue = undefined;
	}

	// #region Commands
	jb_connect(interaction, channel) {
		const channelId = this.selectChannelId(channel, interaction.member.voice.channel);

		if (!channelId) {
			return interaction.replyError('Specify a voice channel or be in a voice channel');
		}

		this.connect(channelId, interaction.guild.voiceAdapterCreator);
    	return interaction.reply("🎵 Started connection !");
	}

	jb_add(interaction, url) {
		if (!this.queue) {
			if (!interaction.member.voice.channel) {
				return interaction.replyError('You are currently not in a voice channel');
			}

			this.connect(interaction.member.voice.channel.id, interaction.guild.voiceAdapterCreator);
		}

		const song_url = this.queue.add(url);
		if (song_url) {
        	return interaction.replySuccess(`🎵 Added to queue: ${song_url}`);
    	}
    	else {
			return interaction.replyError('Failed to add to queue');
    	}
	}

	jb(interaction, action) {
		if (!this.queue) {
            return interaction.replyError('There is currently no jukebox');
        }

		switch (action) {
		    case 'play':
		    	this.queue.resume();
                return interaction.reply("▶️ Play");
		    case 'pause':
		    	this.queue.pause();
                return interaction.reply("⏸ Paused");
		    case 'stop':
		    	this.queue.stop();
                return interaction.reply("⏹ Stopped music and cleared queue");
		    case 'skip':
		    	this.queue.skip();
		    	return interaction.reply("⏭ Skipped current song. Now playing : " + this.queue.getCurrent());
		    case 'loop':
		    	const loopState = this.queue.changeLoop();
		    	return interaction.reply(loopState ? "🔁 Loop enabled" : "🔁 Loop disabled");
		    case 'play-again':
		    	this.queue.playAGain();
		    	return interaction.reply("▶️ Replaying : " + this.queue.getCurrent());
		    case 'now-playing':
		    	return interaction.reply("🎵 Now playing : " + this.queue.getCurrent());
		    case 'list':
		    	return interaction.reply("🎵 Now playing : " + this.queue.getCurrent() + "\n Playlist :\n" + this.queue.getQueue());
		    default:
		    	return interaction.replyError('Unknown action');
	    }
	}
	// #endregion Commands

	// #region Events
	disconnect(oldState, newState) {
		if (oldState.channelId === newState.channelId) { return; }

		setTimeout(() => {
            let connection = getVoiceConnection(this.guildId);
            if (!connection) { return; }

            const channelId = connection.joinConfig?.channelId;
            if (!channelId) return;

            const channel = oldState.guild.channels.cache.get(channelId);

        	const nonBotMembers = channel.members.filter(m => !m.user.bot);
    	    if (nonBotMembers.size === 0) {
    	        if (this.queue) {
    	            this.queue.stop(); // stop audio
					this.queue = undefined;
    	        }

    	        if (connection) {
    	            connection.destroy(); // disconnect bot
    	        }
				this.logger.info(`Left VC (nobody left)`);
    	    }
    	}, 10_000);
	}
	// #endregion Events

	selectChannelId(channel, memberVocalChannel) {
    	if (channel) { // If vocal is specified
			return channel.id;
		}
		else if (memberVocalChannel) { // If member in a vocal
			return memberVocalChannel.id
		}
		else {
    	    return undefined;
		}
	}

	connect(channelId, guildVoiceAdapterCreator) {
		const connection = joinVoiceChannel({
    		channelId: channelId,
    		guildId: this.guildId,
    		adapterCreator: guildVoiceAdapterCreator,
    		selfMute: false,
			selfDeaf: false,
    	});

		this.queue = new MusicQueue(connection, () => this.tryUpdateYtDlp());
		return connection;
	}

	updateYtDlp() {
    	return new Promise((resolve, reject) => {
    	    execFile(ytDlpPath, ['-U'], (error, stdout) => {
    	        if (error) return reject(error);
    	        resolve(stdout);
    	    });
    	});
	}

	async tryUpdateYtDlp() {
		const now = Date.now();
	
		// cooldown check
		if (ytDlpUpdateCooldownUntil > now) { return this.logger.warning('yt-dlp update skipped (cooldown active)'); }
		if (ytDlpUpdateInProgress) { return this.logger.warning('yt-dlp update already in progress'); }
	
		ytDlpUpdateInProgress = true;
		let result;

		const ONE_HOUR = 60 * 60 * 1000;
		const SIX_HOURS = 6 * ONE_HOUR;
	
		try {
			this.logger.info('Updating yt-dlp...');
			await this.updateYtDlp();
			this.logger.info('yt-dlp updated successfully');
			ytDlpUpdateCooldownUntil = Date.now() + SIX_HOURS;
			result = true;
		} catch (error) {
			this.logger.error('yt-dlp update failed: ', error);
			ytDlpUpdateCooldownUntil = Date.now() + ONE_HOUR;
			result = false;
		}
		// 1 hour cooldown
		ytDlpUpdateInProgress = false;
		return result
	}
}
