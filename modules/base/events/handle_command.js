import { Events, MessageFlags } from 'discord.js';

import { logError, logWarning } from '../../../utils/colors_handling.js';
import { InteractionExtended } from '../../../utils/InteractionExtended.js';
import { getGuild } from '../../../utils/Guild.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
	if (interaction.isChatInputCommand()) {
		executeCommand(interaction);
	}
	else if (interaction.isAutocomplete()) {
		autocompleteCommand(interaction);
	}
	else {
		logWarning(`Received non-command interaction: ${interaction.commandName}`);
	}	
};

async function executeCommand(interaction) {
	const command = interaction.client.commands.get(interaction.commandName);
	const guild = getGuild(interaction.client, interaction.guildId);

	if (!verifyCommand(command, guild)) {
		return;
	}

	const interactionExtended = new InteractionExtended(interaction);
	const module = guild.getModule(command.data.moduleName);

	try {
		await command.execute(module, interactionExtended);
	} catch (error) {
		logError(error);
		if (interactionExtended.replied || interactionExtended.deferred) {
			await interactionExtended.followUpError('There was an error while executing this command!');
		} else {
			await interactionExtended.replyError('There was an error while executing this command!');
		}
	}
}

function verifyCommand(command, guild) {
	if (!command) {
		logError(`No command matching ${interaction.commandName} was found.`);
		return false;
	}	

	if (!guild || !guild.hasModule(command.data.moduleName)) {
		logError(`Guild ${interaction.guildId} does not have the module required for command ${command.data.name}.`);
		return false;
	}
	return true;
}

async function autocompleteCommand(interaction) {
	const newInteraction = new InteractionExtended(interaction);

	const command = newInteraction.client.commands.get(newInteraction.commandName);
	if (!command) {
		logError(`No command matching ${newInteraction.commandName} was found.`);
		return;
	}

	try {
		await command.autocomplete(newInteraction);
	} catch (error) {
		console.error(error);
		logError(error);
		if (newInteraction.replied || newInteraction.deferred) {
			await newInteraction.followUp({ content: 'There was an error while autocompleting this command!', flags: MessageFlags.Ephemeral });
		} else {
			await newInteraction.reply({ content: 'There was an error while autocompleting this command!', flags: MessageFlags.Ephemeral });
		}
	}
}