import { Events } from 'discord.js';
import { logError, logWarning } from '../../../utils.js';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction) {
	if (!interaction.isChatInputCommand()) {
		logWarning(`Received non-command interaction: ${interaction.commandName}`);
		return;
	}

	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		logError(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		logError(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
};
