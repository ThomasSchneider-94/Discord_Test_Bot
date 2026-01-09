import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('rtr-setup')
	.setDescription('Setup a message for reaction-based role assignment')
    .addStringOption(option =>
		option.setName('action')
			.setDescription('Setup action')
            .setRequired(true)
            .addChoices(
				{ name: 'Add', value: 'add' },
				{ name: 'Remove', value: 'remove' },
				{ name: 'View', value: 'view' }
			))
    .addStringOption(option =>
		option.setName('messsage-link')
			.setDescription('Link of the message to manage')
            .setRequired(true))
    
    .addRoleOption(option =>
        option.setName('role')
            .setDescription('The role to assign when the reaction is added'))
    .addStringOption(option =>
        option.setName('emoji')
            .setDescription('Specific emoji to target'))    
    .addBooleanOption(option =>
        option.setName('any-reaction')
            .setDescription('Apply to any reaction (Default: False)'));
