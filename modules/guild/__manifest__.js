import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'guild',
    displayName: 'Guild',
    description: 'Base module of each server providing essential commands and configurations. Not installable or uninstallable',
    author: 'Thomas Schneider',
    class: 'Guild',
    permissions: [
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads
    ],
    events: [
        'handle_command.js',
    ],
    configs: [
        'modules.json',
        'security.json'
    ],
    commands: [
        { 
            file: 'help.js', 
            name: 'help', 
            description: 'Display information about a command, module or general information about the bot if no argument is provided.',
            args: [
                { name: 'module', required: true, description: 'Name of the module you want info on. Can also be used to filter the commands autocomplete.' },
                { name: 'command', description: 'Name of the command you want info on. If multiple modules provide the command, use the format `command (module)`.' },
            ]
        },
        { 
            file: 'module.js',
            name: 'module', 
            description: 'Install or remove modules on the server.',
            args: [
                { name: 'action', required: true, description: "Either 'Add' or 'Remove', the action you want to perform." },
                { name: 'module', required: true, description: 'Name of the module you want to install or remove.' },
            ]
        },
        { 
            file: 'permissions.js', 
            name: 'permissions', 
            description: 'Manage or review the modules and command permissions. If command and module are specified, only the command argument is considered.' ,
            args: [
                { name: 'action', required: true, description: "Either 'Add', 'Remove' or 'View', the action you want to perform." },
                { name: 'module', description: 'Name of the module of which the permissions needs to be managed or reviewed. Can also be used to filter the commands autocomplete.' },
                { name: 'command', description: 'Name of the command of which the permissions needs to be managed or reviewed.' },
                { name: 'role', description: "The role which need to be added or removed. If 'Remove' is selected and role is not specified, remove all restriction from the module or command. If 'View' action is selected, display all commands usable by the role." },
                { name: 'include-higher-roles', description: "When adding permissions, does the permission extend to all roles above? When removing permission, specifically remove the minimal required role." },
            ]
        }
    ]
};
