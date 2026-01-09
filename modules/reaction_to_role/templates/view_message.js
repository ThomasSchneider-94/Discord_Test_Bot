export const template = {
    title: 'Message configuration',
    color: 0x0099ff,
    description: (context) => `Current roles that can be granted when reacting to the message ${context.messageLink}`,
    fields: (context) => {
        const fields = [];
        if (context.emojisToRoles?.length > 0) {
            fields.push(
                {
                    name: 'Emojies to Role',
                    value: `- ${context.emojisToRoles.map(emojiToRole => `${emojiToRole.emoji} → ${emojiToRole.role}`).join('\n- ')}`,
                    inline: true
                }
            );
        }
        if (context.anyReactionRole) {
            fields.push(
                {
                    name: 'Any reaction',
                    value: context.anyReactionRole,
                    inline: true
                }
            );
        }

        return fields;
    }
};