import { createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { YtDlp } from 'ytdlp-nodejs';
import { PassThrough } from 'stream';

import { logError } from '../../utils.js';

// Map of guildId → queue object
export const guildQueues = new Map();

// Each guild queue stores:
// - player: AudioPlayer
// - ytdlp: yt-dlp API
// - songs: array of { url, title }
// - current: current song
export class GuildQueue {
    constructor(connection) {
        this.player = createAudioPlayer();
        this.ytdlp = new YtDlp();
        this.songs = [];
        this.current = null;

        // Subscribe player to connection
        connection.subscribe(this.player);

        // Auto-play next song
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.playNext();
        });
    }

    enqueue(url) {
        const id = extractYouTubeId(url);

        if (!id) { return null };

        const song_url = `https://www.youtube.com/watch?v=${id}`

        const song = { url: song_url, title: null };
        this.songs.push(song);

        this.setTitle(song);

        if (!this.current) {
            this.playNext();
        }

       return song_url;
    }

    async setTitle(song) {
        const name_ytdlp = new YtDlp();
        const jsonString = await name_ytdlp._executeAsync(
            [song.url, "--dump-single-json"]
        );

        const info = JSON.parse(jsonString);
        song.title = info.fulltitle || info.title || song.url;
    }

    async playNext() {
        const nextSong = this.songs.shift();
        if (!nextSong) {
            this.current = null;
            return;
        }
        this.current = nextSong;

        // Create stream for next song
        const ytdlpStream = this.ytdlp.stream(nextSong.url, {
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

function extractYouTubeId(url) {
    const YT_REGEX = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const match = url.match(YT_REGEX);
    return match ? match[1] : null;
}