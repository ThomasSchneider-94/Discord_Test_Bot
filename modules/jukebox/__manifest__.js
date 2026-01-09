import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'jukebox',
    displayName: 'Jukebox',
    description: 'Jukebox module to play music from Youtube in voice channels.',
    author: 'Thomas Schneider',
    class: 'Jukebox',
    permissions: [
        PermissionFlagsBits.Connect, 
        PermissionFlagsBits.Speak
    ],
    events: [
        'disconnect.js',
    ],
    commands: [
        { 
            file: 'jukebox_action.js',
            name: 'jb', 
            description: 'Perform a specific action (play, pause, skip...).',
            args: [
                { name: 'action', required: true, description: 'Action to perform: Play, Pause, Skip, Play again, loop, display current music or waiting list.' },
            ]
        },
        {
            file: 'jukebox_add.js', 
            name: 'jb-add', 
            description: 'Add a music to the waiting list. If the bot is not connected to a voice chanel, it connects to the one you are currently in.' ,
            args: [
                { name: 'url', required: true, description: 'Youtube url of the music to play.' }
            ]
        },        
        { 
            file: 'jukebox_connect.js', 
            name: 'jb-connect', 
            description: 'Connect the bot to a voice channel or the voice channel you are currently in.',
            args: [
                { name: 'channel', description: 'Voice channel to cennect to.' },
            ]
        },
    ],
    features: "The bot disconnect after 10s of being left alone in a voice channel."
};
