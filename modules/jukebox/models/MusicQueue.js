import { createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } from '@discordjs/voice';
import prism from 'prism-media'; 
import { YtDlp } from 'ytdlp-nodejs';
import { PassThrough } from 'stream';

import { Queue } from '#utils';
import { execFile } from 'child_process';

// - player: AudioPlayer
// - ytdlp: yt-dlp API
// - ytdlp: yt-dlp API for title fetching
// - current: current song
// - loop: does loop is enabled
export class MusicQueue extends Queue {
    constructor(connection, ytdlpUpdateFunction=undefined) {
        super();
        this.player = createAudioPlayer();
        this.ytdlp = new YtDlp();
        this.name_ytdlp = new YtDlp();
        this.current = null;
        this.loop = false;
        this.ytdlpUpdateFunction = ytdlpUpdateFunction;

        // Subscribe player to connection
        connection.subscribe(this.player);
        connection.on('stateChange', (oldState, newState) => {
            console.log('Connection state:', oldState.status, '→', newState.status);
        });

        // Auto-play next song
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.next();
        });
        this.player.on('error', async (error) => {
            await this.ytdlpUpdateOnError(error);
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('▶️ Playing audio');
        });
    }

    add(url) {
        const id = this.extractYouTubeId(url);
        if (!id) { return null };

        const song_url = `https://www.youtube.com/watch?v=${id}`

        const song = { url: song_url, title: null };
        this.setTitle(song);
        super.add(song);

        if (!this.current) {
            this.next();
        }

       return song_url;
    }

    async setTitle(song) {
        const jsonString = await this.name_ytdlp._executeAsync(
            [song.url, "--dump-single-json"]
        );

        const info = JSON.parse(jsonString);
        song.title = info.fulltitle || info.title || song.url;
        return song.title;
    }

    async next() {
        let nextSong;
        if (this.loop && this.current) {
            nextSong = this.current;
        }
        else {
            nextSong = super.next();
        }

        if (!nextSong) {
            this.current = null;
            return;
        }
        this.current = nextSong;

        // Create stream for next song
        const ytdlpStream = this.ytdlp.stream(nextSong.url, {
            format: { filter: "audioonly", quality: 5 }
        });

        let handledError = false;
        ytdlpStream.on('error', async (error) => {
            if (handledError) { return; }
            handledError = true;
            await this.ytdlpUpdateOnError(error, () => this.playAGain(), () => this.next());
        });

        const ffmpeg = new prism.FFmpeg({
            args: [
                '-i', 'pipe:0',
                '-analyzeduration', '0',
                '-loglevel', '0',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2',
            ],
        });

        const stream = ytdlpStream.pipe(ffmpeg);

        const resource = createAudioResource(stream, {
            inputType: StreamType.Raw,
        });

        this.player.play(resource);
    }
        
    skip() {
        this.current = null;
        this.player.stop(true);
    }

    stop() {
        this.clear();
        this.player.stop(true);
    }

    pause() {
        this.player.pause();
    }

    resume() {
        this.player.unpause();
    }

    changeLoop() {
        this.loop = !this.loop;
        return this.loop;
    }

    playAGain() {
        if (this.current) {
            this.addFirst(this.current);
            this.player.stop(true);
        }
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

    extractYouTubeId(url) {
        const YT_REGEX = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        const match = url.match(YT_REGEX);
        return match ? match[1] : null;
    }

    async ytdlpUpdateOnError(error, successCallback=undefined, failCallback=undefined) {
        const errorMessage = error?.message || '';

        if (!errorMessage.includes('ExtractorError') &&
            !errorMessage.includes('Unsupported URL')) {
            return failCallback?.();
        }
        
        if (this.ytdlpUpdateFunction) {
            const updated = await this.ytdlpUpdateFunction();
            
            if (updated) {
                successCallback?.();
            } 
            else {
                failCallback?.();
            }
        }
    }
}
