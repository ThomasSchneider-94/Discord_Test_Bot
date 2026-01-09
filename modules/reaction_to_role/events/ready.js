import { Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;
export const execute = "fetchMessages";
