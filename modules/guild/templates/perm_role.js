export const template = {
    title: (context) => `🔐 Permissions - @${context.role}`,
    color: 0x0099ff,
    description: 'List of command the given role can use.',
    fields: (context) => {
        const fields = [];

        for (const module of context.modules) {
            fields.push(
                { 
                    name: `📦 ${module.displayName}`, 
                    value: module.commands
                        ? module.commands.length > 0
                            ? 'Available commands: ' + module.commands.map(command => `\`/${command}\``).join(', ')
                            : 'No command available'
                        : 'All command available',
                }
            );
        }

        return fields;
    }
};