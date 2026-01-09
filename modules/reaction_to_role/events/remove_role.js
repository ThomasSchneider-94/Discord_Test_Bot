import { Events } from 'discord.js';

export const name = Events.MessageReactionRemove;
export const once = false;
export const execute = "remove_role";
