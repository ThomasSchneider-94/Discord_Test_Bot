import { MessageFlags } from 'discord.js';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


/// Constants
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const __baseModule = "base";

/// Module file handling
export function moduleFileToPath(module, ...pathParts) {
	return join(__dirname, 'modules', module, ...pathParts);
}

export function moduleFileToUrl(module, ...pathParts) {
	return pathToFileURL(moduleFileToPath(module, ...pathParts));
}

export async function importFromModuleFile(module, ...pathParts) {
	return await import(moduleFileToUrl(module, ...pathParts));
}

export async function importFromPath(filePath) {
	return await import(pathToFileURL(filePath));
}

/// Get file or folder from module
export function getModuleData(module, ...fileOrFolder) {
	return join(__dirname, 'modules', module, 'data', ...fileOrFolder);
}

export function getModuleConfig(module, file) {
	return join(__dirname, 'modules', module, 'config', file);
}

/// Logging functions
export async function logError(message) {
	console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
}

export async function logWarning(message) {
	console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`);
}

export async function logInfo(message) {
	console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
}

/// Images
export function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
	r: (bigint >> 16) & 255,
	g: (bigint >> 8) & 255,
	b: bigint & 255,
  };
}

export function rgbToHex(rgb) {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

/// Command reply helpers
export async function replyError(interaction, message) {
	await interaction.reply({ content: `❌ ${message}`, flags: MessageFlags.Ephemeral });
}

export async function replyWithAttachments(interaction, message, attachments = [], ephemeral = false) {
	await interaction.reply({ content: message, files: attachments, flags: ephemeral ? MessageFlags.Ephemeral : 0 });
}

export const autocompleteArguments = async (interaction, choices) => {
	const focusedValue = interaction.options.getFocused();
	const filtered = choices.filter(choice => choice.startsWith(focusedValue));
	await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
};

export async function defferReplyIfLongProcessing(interaction, generatingFunction, ephemeral = false) {
    // generatingFunction should return { content, files } where attachments is an array
    await interaction.deferReply();

    try {
        const { content, files } = await generatingFunction();

          await interaction.editReply({ content: content, files: files, flags: ephemeral ? MessageFlags.Ephemeral : 0 });
    } catch (err) {
          await interaction.editReply({ content: "❌ An error occurred", flags: MessageFlags.Ephemeral});
    }
}