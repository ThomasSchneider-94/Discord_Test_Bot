import { MessageFlags } from 'discord.js';

export class InteractionExtended {
    constructor(interaction) {
        this._interaction = interaction;

        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }

                const value = target._interaction[prop];

                // Bind functions to the original interaction
                if (typeof value === "function") {
                    return value.bind(target._interaction);
                }

                return value;
            }
        });
    }

    async reply(content, ephemeral = false) {
	    await this._interaction.reply({
            content: content,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async replyWithAttachments(content, files = [], ephemeral = false) {
        await this._interaction.reply({
            content: content,
            files: files,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async replyWithEmbed(embed, ephemeral = false) {
        await this._interaction.reply({
            embeds: embed,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async followUp(content, ephemeral = false) {
        await this._interaction.followUp({
            content: content,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async editReply(content) {
	    await this._interaction.editReply({
            content: content
        });
    }

    async followUpWithAttachments(content, files = [], ephemeral = false) {
        await this._interaction.followUp({
            content: content,
            files: files,
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });
    }

    async deferReplyAndGenerateResponse(generatingFunction, ephemeral = false) {
        // generatingFunction should return { content, files } where files is an array
	    await this._interaction.deferReply({
            flags: ephemeral ? MessageFlags.Ephemeral : 0
        });

        const { content, files } = await generatingFunction();

  		await this._interaction.editReply({ 
            content: content, 
            files: files
        });
    }

    //#region Success
    async replySuccess(content, ephemeral = false) {
        await this.reply(`✅ ${content}`, ephemeral);
    }

	async replySuccessWithAttachments(content, files = [], ephemeral = false) {
        await this.replyWithAttachments(`✅ ${content}`, files, ephemeral);
    }

    async editReplySuccess(content) {
	    await this.editReply(`✅ ${content}`);
    }

    async followUpSuccess(content, ephemeral = false) {
        await this.followUp(`✅ ${content}`, ephemeral);
    }
    //#endregion Success

    //#region Error
    async replyError(error) {
        await this.reply(`❌ ${error}`, true);
    }

    async editReplyError(error) {
	    await this.editReply(`❌ ${error}`);
    }

    async followUpError(error) {
        await this.followUp(`❌ ${error}`, true);
    }
    //#endregion Error

    //#region Warning
    async replyWarning(content, ephemeral = false) {
        await this.reply(`⚠️ ${content}`, ephemeral);
    }

	async replyWarningWithAttachments(content, files = [], ephemeral = false) {
        await this.replyWithAttachments(`⚠️ ${content}`, files, ephemeral);
    }

    async editReplyWarning(content) {
	    await this.editReply(`⚠️ ${content}`);
    }

    async followUpWarning(content, ephemeral = false) {
        await this.followUp(`⚠️ ${content}`, ephemeral);
    }
    //#endregion Warning
}
