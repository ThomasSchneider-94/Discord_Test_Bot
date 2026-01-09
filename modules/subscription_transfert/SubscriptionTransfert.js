const { WebhookClient, AttachmentBuilder } = require('discord.js');

import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';

import { getRoleName, Cache } from '#utils';

export default class SubscriptionTransfert extends Module {
	constructor(guildId, guildName) {
		super(manifest, guildId, guildName);

        this.lastTransfers = new Cache(3);
        this._suscribedServersConfigKey = "suscribed_servers";
	}

    // TODO : configuration commands: role list, webhook appearance and general config
    
	// #region Events
	async message_transfert(message) {
        // TODO : verify if the subscription transfert is flagged as a bot or not
        // Ignore the message if not in a receiving channel
        const receivingChannelConfig = this.configs[this._suscribedServersConfigKey][message.channel.id];
        if (!messageData) { return; }
        
        // Ignore this bot or webhook message
        if (message.author.id == client.user.id || message.author.id == webhookClient.id) { return; }

        const serverConfig = receivingChannelConfig[message.author.id];
        if (!serverConfig) { return; }

        // Custom the webhook with the given instructions
        const { webhookURL } = require('../../config.json'); // TODO get the webhook url
        const webhookClient = new WebhookClient({ url: webhookURL });
        
        await webhookClient.edit({
            name: serverConfig.name,
            avatar: serverConfig.avatarUrl,
        })

        // Text content
        const content = this.processMessageContent(message.content, message.guild, serverConfig);
        
        // File attachements
        const attachments = [];
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                const attachmentFile = new AttachmentBuilder(attachment.url);
                attachments.push(attachmentFile);
            });
        }
        
        await webhookClient.send({
            content: content,
            files: attachments
        }).then(sentMessage => this.lastTransfers.set(message.id, sentMessage.id));
    }

    async message_update(oldMessage, newMessage) {
        const transfert = this.lastTransfers.get(oldMessage.id);
		if (!transfert) return;

        const webhookClient; // TODO: get webhook

        if (newMessage.content == "[Original Message Deleted]" || newMessage.content == "[Message d'origine supprimé]") {
            webhookClient.deleteMessage(webhookMessageId);
        }
        else {
            // Todo: get server config
            const serverConfig;            
            const content = processMessageContent(newMessage.content, newMessage.guild, serverConfig);

            // Update the message content
            webhookClient.editMessage(webhookMessageId, {
                content: messageContent
            });
        }
    }
	// #endregion Events

    processMessageContent(content, guild, serverConfig) {
        if (content.length == 0 && !this.configs["TODO General Config"].serverPingOnEmpty) { return ""; }

        let result = "";
        if (serverConfig.serverRoleId) {
            result += `${getRoleName(guild, serverConfig.serverRoleId)}\n`;
        }

        // TODO: Use a regex to detect string starting with @ (until the next @)
        const mentions = [];
        for (const mention of mentions) {
            for (const equivalence of this.configs["TODO: General Config"]) {
                for (const roleName of equivalence) {
                    if (mention.slice(0, roleName.length) == role) {
                        mention = mention.replace(roleName, getRoleName(guild, equivalence.serverRole));
                        break;
                    }
                }
            }
        }
        result = mentions.join('');
        
        if (this.configs["TODO General Config"].allowPingEveryone && content.includes('@everyone')) {
            result.replace('@everyone', guild.roles.everyone.toSting());
        }
        return result;
    }
}
