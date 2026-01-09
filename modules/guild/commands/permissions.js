import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('permissions')
	.setDescription('Set the commands and module permission use for users.')
    .addStringOption(option =>
		option.setName('action')
			.setDescription('Action to perform')
            .setRequired(true)
            .addChoices(
				{ name: 'Add', value: 'add' },
				{ name: 'Remove', value: 'remove' },
				{ name: 'View', value: 'view' },
			))

    .addStringOption(option =>
		option.setName('module')
			.setDescription('Target module (cannot be used with "command")')
			.setAutocomplete(true)
			)    
    .addStringOption(option =>
		option.setName('command')
			.setDescription('Target command (cannot be used with "module")')
			.setAutocomplete(true)
			)

    .addRoleOption(option =>
        option.setName('role')
            .setDescription('Role to apply the permission to'))
    .addBooleanOption(option =>
		option.setName('include-higher-roles')
			.setDescription('Apply to all roles above this one in the hierarchy (default: false)')
			);

export const autocomplete = {
	"module": "managableModuleNames",
	"command": { function: "guildCommandsByModule", args: ['module'] }
}
