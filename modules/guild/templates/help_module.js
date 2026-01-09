export const template = {
    title: (context) => `📦 ${context.displayName}`,
    color: 0x0099ff,
    url: (context) => `https://github.com/ThomasSchneider-94/Discord_Test_Bot/tree/master/modules/${context.name}`,
    description: (context) => context.description || 'No description provided.',
    fields: (context) => {
        const fields = [];

        if (context.commands?.length > 0) {
            fields.push(
                { 
                    name: `⚙️ Commands`,
                    value: `- ${context.commands.map(command => `\`/${command.name}\`\n ${command.description || 'No description provided.'}`).join('\n- ')}`
                }
            );
        }
        fields.push(
            { 
                name: '📚 Required Permissions', 
                value: context.permissions?.length > 0
                    ? `\`${context.permissions.join('`, `')}\``
                    : 'No extra permission needed.'
            }
        );
        if (context.features) {
            fields.push({ name: '📋 Features', value: context.features });
        }

        return fields;
    }
};