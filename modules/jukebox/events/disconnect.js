import { Events } from 'discord.js';

export const name = Events.VoiceStateUpdate;
export const once = false;
export const execute = "disconnect";
