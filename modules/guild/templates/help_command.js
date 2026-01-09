export const template = {
    title: (context) => {
        const required = context.args
            ?.filter(arg => arg.required)
            .map(arg => `\`${arg.name}\``)
            .join(' ') || '';
        
        return `⚙️ /${context.name} ${required}`
    },
    color: 0x0099ff,
    description: (context) => `📦 Module: \`${context.moduleName}\`.\n${context.description || 'No description provided.'}`,
    fields: (context) => {
        const fields = [];

        if (context.args?.length > 0) {
            for (const arg of context.args) {
                fields.push(
                    { 
                        name: `- \`${arg.name}\`${arg.required ? '' : ' *optional*'}`, 
                        value: arg.description || ''
                    }
                );
            }
        }

        if (context.permissions) {
            if (!context.permissions.effectiveMinRole && !context.permissions.effectiveAllowedRoles) {
                fields.push({
                    name: '\u200B',
                    value: 'There is no restriction on the command use.',
                    inline: true
                });
            }
            else {
                if (context.permissions.effectiveMinRole) {
                    fields.push({
                        name: '📌 Minimum required role',
                        value: `${context.permissions.effectiveMinRole}${context.permissions.minRoleFromModule ? ' *(from module)*' : ''}`,
                        inline: true
                    });
                }

                if (context.permissions.effectiveAllowedRoles) {
                    fields.push({
                        name: '👥 Allowed roles',
                        value: `${context.permissions.effectiveAllowedRoles}${context.permissions.allowedRolesFromModule ? ' *(from module)*' : ''}`,
                        inline: true
                    });
                }
            }
        }
        return fields;
    }
};