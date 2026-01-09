import { Events } from 'discord.js';

export const EVENT_CONFIG = {
    [Events.GuildCreate]: {
        scope: "core"
    },
    [Events.GuildDelete]: {
        scope: "core"
    },
    [Events.ClientReady]: { // arg: client
        scope: "global"
    },
    [Events.InteractionCreate]: {
        guildExtractor: (interaction) => interaction.guild?.id,
        scope: "guild"
    },
    [Events.VoiceStateUpdate]: {
        guildExtractor: (oldState, newState) => newState.guild?.id,
        scope: "guild"
    },
    [Events.MessageReactionAdd]: {
        guildExtractor: (reaction, user) => reaction.message.guild?.id,
        scope: "guild"
    },
    [Events.MessageReactionRemove]: {
        guildExtractor: (reaction, user) => reaction.message.guild?.id,
        scope: "guild"
    },
    [Events.MessageCreate]: {
        guildExtractor: (message) => message.guild?.id,
        scope: "guild"
    },
    [Events.MessageUpdate]: {
        guildExtractor: (oldMessage, newMessage) => newMessage.guild?.id,
        scope: "guild"
    },
    [Events.MessageDelete]: {
        guildExtractor: (message) => message.guild?.id,
        scope: "guild"
    },
};