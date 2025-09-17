import { Events } from 'discord.js';
import { configFiles } from '../../../config.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {

    const { reactionToRole }  = configFiles.reaction_to_role

    // Load messages to check
    for (const message of reactionToRole) {
        const channel = client.channels.cache.get(message.channelId);
        try {
            await channel.messages.fetch(message.messageId);
        } catch (error) {
             console.error(`[ERROR] reaction_to_role - Error while fetching the message ${message.name}: ${error.message}`);
        }
    }
    console.log('[INFO] reaction_to_role - READY');
}