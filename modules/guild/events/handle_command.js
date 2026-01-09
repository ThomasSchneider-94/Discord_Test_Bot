import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = "handleCommands";
