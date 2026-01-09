import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'reaction_to_role',
    author: 'Thomas Schneider',
    displayName: "Reaction to Role",
    description: 'Module to assign roles to users based on their reactions. Add or remove roles from users based on their reactions to specific messages.',
    class: 'ReactionToRole',
    permissions: [
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.AddReactions,
    ],
    commands: [
        { file: '.js', name: '', description: '' }
    ],
    events: [
        'ready.js',
        'add_role.js',
        'remove_role.js'
    ],
    configs: [
        'reaction_to_role.json'
    ],
    commands: [
        { 
            file: 'rtr_setup.js',
            name: 'rtr-setup', 
            description: 'Manage a message for reaction-based role assignment.',
            args: [
                { name: 'action', required: true, description: "Either 'Add', 'Remove' or 'View', the action you want to perform. If 'Remove' is selected and no other arguments are filled, remove all configuration from the message." },
                { name: 'messsage-link', required: true, description: 'Link of the message to manage.' },
                { name: 'role', description: "The role to assign when the reaction is added. If 'Remove' is selected, all occurence or the role are removed from the message." },
                { name: 'emoji', description: "Specific emoji to target. Do not use at the same time as 'any-reaction'." },
                { name: 'any-reaction', description: "When adding a role, do you want the role to be added on any emoji? When removing permission, specifically remove the role added with any emoji." },
            ]
        }
    ]
};
