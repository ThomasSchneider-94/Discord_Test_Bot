import { Events } from 'discord.js';

export const name = Events.GuildCreate;
export const once = false;
export const execute = "guildJoin";
