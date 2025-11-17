import { Events } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

import { guildQueues } from '../guildQueue.js';
import { logInfo } from '../../../utils.js';

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(oldState, newState) {
    if (oldState.channelId === newState.channelId) { return; }

    setTimeout(() => {
            let connection = getVoiceConnection(oldState.guild.id);
            if (!connection) { return; }

            const channelId = connection.joinConfig?.channelId;
            if (!channelId) return;

            const channel = oldState.guild.channels.cache.get(channelId);

        const nonBotMembers = channel.members.filter(m => !m.user.bot);
        if (nonBotMembers.size === 0) {
            const queue = guildQueues.get(oldState.guild.id);

            if (queue) {
                queue.stop(); // stop audio
                guildQueues.delete(oldState.guild); // cleanup
            }

            if (connection) {
                connection.destroy(); // disconnect bot
            }            
            logInfo(`Left VC in guild ${oldState.guild} (nobody left)`);
        }
    }, 10_000);
}

