import { Events } from 'discord.js';

export const name = Events.MessageDelete;
export const once = false;
export const execute = "deleteLink";
