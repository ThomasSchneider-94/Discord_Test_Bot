import { Events, MessageFlags } from 'discord.js';

import { logError, logWarning } from '../../../utils.js';
import { ExtendedInteraction } from '../../../utils/ExtendedInteraction.js';

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
	const newInteraction = new ExtendedInteraction(interaction);

	const command = newInteraction.client.commands.get(newInteraction.commandName);
	if (!command) {
		logError(`No command matching ${newInteraction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(newInteraction);
	} catch (error) {
		logError(error);
		if (newInteraction.replied || newInteraction.deferred) {
			await newInteraction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await newInteraction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
}

async function autocompleteCommand(interaction) {
	const newInteraction = new ExtendedInteraction(interaction);

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