import { Events } from 'discord.js';

export const name = Events.MessageReactionAdd;
export const once = false;
export const execute = "add_role";
