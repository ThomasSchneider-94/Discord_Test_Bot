import { Module } from '../../models/Module.js';
import { data } from './__manifest__.js';

export default class Jukebox extends Module {
	constructor(guildId, guildName) {
		super(guildId, guildName, data.name);
	
		this.queue = null;
	}
	
	init() {
		super.init(data);
		this.logger.info('Jukebox module initialized');
		return this;
	}

    //#region Command Actions
    jb(interaction, action) {
        console.log(`Jukebox action called: ${action}`);

        if (!this.queue) {
            interaction.replyError('There is currently no jukebox');
            return;
        }

        switch (action) {
		    case 'play':
		    	this.queue.resume();
                interaction.reply("▶️ Play");
		    	break;
		    case 'pause':
		    	this.queue.pause();
                interaction.reply("⏸ Paused");
		    	break;
		    case 'stop':
		    	this.queue.stop();
                interaction.reply("⏹ Stopped music and cleared queue");
		    	break;
		    case 'skip':
		    	this.queue.skip();
		    	interaction.reply("⏭ Skipped current song. Now playing : " + this.queue.getCurrent());
		    	break;
		    case 'loop':
		    	const loopState = this.queue.changeLoop();
		    	interaction.reply(loopState ? "🔁 Loop enabled" : "🔁 Loop disabled");
		    	break;
		    case 'play-again':
		    	this.queue.playAGain();
		    	interaction.reply("▶️ Replaying : " + this.queue.getCurrent());
		    	break;
		    case 'now-playing':
		    	interaction.reply("🎵 Now playing : " + this.queue.getCurrent());
		    	break;
		    case 'list':
		    	interaction.reply("🎵 Now playing : " + this.queue.getCurrent() + "\n Playlist :\n" + this.queue.getQueue());
		    	break;
		    default:
		    	interaction.replyError('Unknown action');
		    	break;
	    }
    }
}
