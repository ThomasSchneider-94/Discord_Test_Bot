import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { YtDlp } from 'ytdlp-nodejs';
import { PassThrough } from 'stream';

// Map of guildId → queue object
export const guildQueues = new Map();

// Each guild queue stores:
// - player: AudioPlayer
// - connection: VoiceConnection
// - songs: array of { title, url }
// - current: current song
export class GuildQueue {
    constructor(connection) {
        this.player = createAudioPlayer();
        this.songs = [];
        this.current = null;

        // Subscribe player to connection
        connection.subscribe(this.player);

        // Auto-play next song
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext();
        });
    }

    enqueue(song) {
        this.songs.push(song);
        if (!this.current) {
            this.playNext();
        }
    }

    async playNext() {
        const nextSong = this.songs.shift();
        if (!nextSong) {
            this.current = null;
            return;
        }
        this.current = nextSong;

        // Create stream for next song
        const ytdlp = new YtDlp();
        const ytdlpStream = ytdlp.stream(nextSong.url, {
            format: { filter: "audioonly", quality: 5 }
        });

        const audioStream = new PassThrough({ highWaterMark: 1 << 25 });
        ytdlpStream.pipe(audioStream);

        const resource = createAudioResource(audioStream);
        this.player.play(resource);
    }

    skip() {
        this.player.stop(true);
    }

    stop() {
        this.songs = [];
        this.player.stop(true);
    }

    pause() {
        this.player.pause();
    }

    resume() {
        this.player.unpause();
    }

    getCurrent() {
        if (this.current) {
            return `[${this.current.title}](<${this.current.url}>)`
        }
        return 'nothing';
    }

    getQueue() {
        return this.songs.reduce((acc, song) => {
            return acc + `[${song.title}](<${song.url}>)\n`;
        }, '');
    }
}
