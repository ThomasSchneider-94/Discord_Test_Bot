export const template = {
    title: (context) => `🔐 Permissions - 📦 ${context.module.displayName}`,
    color: 0x0099ff,
    url: (context) => `https://github.com/ThomasSchneider-94/Discord_Test_Bot/tree/master/modules/${context.module.name}`,
    description: (context) => 'Commands without specific permissions inherit the module\'s permissions.\nIf no permissions are set, the commands are accessible to everyone.'
                                + (context.followModulePermsCommands?.length > 0
                                    ? `\nThe following commands follow the module permissions: \`${context.followModulePermsCommands.join('`, `')}\`.`
                                    : ''),
    fields: (context) => {
        const fields = [];

        if (!context.minRole && !context.allowedRoles?.length > 0) {
            fields.push({
                name: '📌 There is no restriction on the module use.',
                value: '\u200B'
            });
        }
        else {
            fields.push(
                {
                    name: '📌 Minimum required role',
                    value: context.minRole || 'None',
                    inline: true
                },
                {
                    name: '👥 Allowed roles',
                    value: context.allowedRoles || 'None',
                    inline: true
                },
                {
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                }
            );
        }
        if (context.modifiedCommands?.length > 0) {
            for (const command of context.modifiedCommands) {
                fields.push(
                    {
                        name: `⚙️ \`/${command.name}\`\n📌 Minimum required role`,
                        value: context.minRole || 'See module',
                        inline: true
                    },
                    {
                        name: '\u200B\n👥 Allowed roles',
                        value: context.allowedRoles || 'See module',
                        inline: true
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true
                    }
                );
            }
        }

        return fields;
    }
};