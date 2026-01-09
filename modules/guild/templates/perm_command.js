export const template = {
    title: (context) => `🔐 Permissions - ⚙️ /${context.name}`,
    color: 0x0099ff,
    description: 'If no permission is specified, the command inherit the module\'s permissions.',
    fields: (context) => {
        const fields = [];

        if (!context.effectiveMinRole && !context.effectiveAllowedRoles) {
            fields.push({
                name: '\u200B',
                value: 'There is no restriction on the command use.'
            });
        }
        else {
            if (context.effectiveMinRole) {
                fields.push({
                    name: '📌 Minimum required role',
                    value: `${context.effectiveMinRole}${context.minRoleFromModule ? ' *(from module)*' : ''}`,
                    inline: true
                });
            }
            if (context.effectiveAllowedRoles) {
                fields.push({
                    name: '👥 Allowed roles',
                    value: `${context.effectiveAllowedRoles}${context.allowedRolesFromModule ? ' *(from module)*' : ''}`,
                    inline: true
                });
            }
        }

        return fields;
    }
};