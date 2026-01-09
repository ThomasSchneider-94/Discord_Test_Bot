import { MessageFlags } from 'discord.js';

export class ExtendedInteraction {
    constructor(interaction) {
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return interaction[prop];
            }
        });
    }

    async replyWithAttachments(message, attachments = [], ephemeral = false) {
        await this.reply({
            content: message,
            files: attachments,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async deferReplyForLongProcess(generatingFunction, ephemeral = false) {
        // generatingFunction should return { message, attachments } where attachments is an array
	    await this.deferReply();

	    try {
		    const { message, attachments } = await generatingFunction();

  		    await this.editReply({ 
                content: message, 
                files: attachments, 
                flags: ephemeral ? MessageFlags.Ephemeral : 0 
            });
	    } catch (err) {
  		    await this.editReply({ 
                content: "❌ An error occurred", 
                flags: MessageFlags.Ephemeral
            });
	    }
    }

    async replyError(message) {
	    await this.reply({
            content: `❌ ${message}`,
            flags: MessageFlags.Ephemeral
        });
    }

    async autocomplete(choices) {
    	const focusedValue = this.options.getFocused();
    	const filtered = choices.filter(choice => choice.startsWith(focusedValue));
    	await this.respond(filtered.map(choice => ({ name: choice, value: choice })));
    };
}
