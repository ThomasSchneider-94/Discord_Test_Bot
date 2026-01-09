import { Events } from 'discord.js';

export const name = Events.GuildDelete;
export const once = false;
export const execute = "guildLeave";
