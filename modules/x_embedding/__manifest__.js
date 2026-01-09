import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'x_embedding',
    author: 'Thomas Schneider',
    displayName: 'X Embedding',
    description: 'Module that provides a proper embedding for X (formerly Twitter) links automatically.',
    class: 'XEmbedding',
    permissions: [
        PermissionFlagsBits.ManageMessages
    ],
    events: [
        'messageSent.js',
        'messageEdit.js',
        'messageDelete.js'
    ],
    features: "When a message contains a link to an X post, the bot will automatically remove the preview and re-send it with a proper embedding of the X post. A message modification or deletion will also trigger the same process on the bot's response."
};
