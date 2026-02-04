import { MessageFlags } from 'discord.js';

export class InteractionExtended {
    constructor(interaction) {
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) return target[prop];
                return interaction[prop];
            }
        });
    }

    async replyWithAttachments(content, files = [], ephemeral = false) {
        await this.reply({
            content: content,
            files: files,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async replyError(error) {
	    await this.reply({
            content: `❌ ${error}`,
            flags: MessageFlags.Ephemeral
        });
    }

    async followUpWithAttachments(content, files = [], ephemeral = false) {
        await this.followUp({
            content: content,
            files: files,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async followUpError(error) {
        await this.followUp({
            content: `❌ ${error}`,
            flags: MessageFlags.Ephemeral
        });
    }

    async deferReplyForLongProcess(generatingFunction, ephemeral = false) {
        // generatingFunction should return { content, files } where attachments is an array
	    await this.deferReply();

	    try {
		    const { content, files } = await generatingFunction();

  		    await this.editReply({ 
                content: content, 
                files: files, 
                flags: ephemeral ? MessageFlags.Ephemeral : 0 
            });
	    } catch (err) {
  		    await this.editReply({ 
                content: "❌ An error occurred", 
                flags: MessageFlags.Ephemeral
            });
	    }
    }

    async autocomplete(choices) {
    	const focusedValue = this.options.getFocused();
    	const filtered = choices.filter(choice => choice.startsWith(focusedValue));
    	await this.respond(filtered.map(choice => ({ name: choice, value: choice })));
    };
}
