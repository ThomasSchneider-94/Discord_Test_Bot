import { EmbedBuilder } from 'discord.js';

import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';

import { getRoleName, renderEmbed } from '#utils';

export default class ReactionToRole extends Module {
    constructor(guildId, guildName) {
        super(manifest, guildId, guildName);

        this._reactionToRoleConfigKey = 'reaction_to_role';
    }

    // #region Commands
    rtr_setup(interaction, action, messageLink, role, emoji, anyReaction) {
        const split = messageLink.split('/');
        if (split.length !== 7 || split[2] !== 'discord.com'|| split[3] !== 'channels') {
            return interaction.replyError('Invalid message format. Please provide the message ID in the format "https://discord.com/channels/[server-id]/[channelId]/[messageId]".');
        }
        const channelId = split[5]; 
        const messageId = split[6];

        switch (action) {
		    case 'add':
                return this.updateMessageRole(interaction, messageLink, messageId, channelId, role, this.getEmojiName(emoji), anyReaction);
		    case 'remove':
                return this.removeMessageRole(interaction, messageLink, messageId, role, this.getEmojiName(emoji), anyReaction);
		    case 'view':
                return this.viewMessageConfig(interaction, messageLink, messageId);
		    default:
		    	return interaction.replyError('Unknown action');
	    }        
    }

    updateMessageRole(interaction, messageLink, messageId, channelId, role, emoji, anyReaction) {
        if (emoji && anyReaction) {
            return interaction.replyError('Do not provide an emoji if `any-emoji` is true.');
        }
        if (!emoji && !anyReaction) {            
            return interaction.replyError('You must provide an emoji or set `any-emoji` to true.');
        }

        if (role.comparePositionTo(interaction.member.roles.highest) > 0) {
            return interaction.replyError(`${role.toString()} is superior than your highest, you cannot set up this role as reaction based.`);
        }
        if (!this.isRoleManagable(interaction.guild, role)) { 
            return interaction.replyError(`Bot's highest role is not high enough to manage the role ${role.toString()}. Please adjust the role hierarchy and try again.`);;
        }

        if (!this.isRoleManagable(interaction.guild, role)) { 
            return interaction.replyError(`Bot's highest role is not high enough to manage the role ${role.toString()}. Please adjust the role hierarchy and try again.`);;
        }

        // Create a new message if it didn't exist
        if (!this.configs[this._reactionToRoleConfigKey][messageId]) {
            this.configs[this._reactionToRoleConfigKey][messageId] = {
                channelId: channelId,
                emojisToRoles: {},
                anyReactionRoleId: undefined
            };
        }

        if(emoji) {
            this.configs[this._reactionToRoleConfigKey][messageId].emojisToRoles[emoji] = role.id;
            const message = interaction.client.channels.cache.get(channelId)?.messages.cache.get(messageId);
            message.react(emoji).catch(error => {
                this.logger.warn(`Failed to add reaction ${emoji} to message: ${error}`);
            });
        } else {
            this.configs[this._reactionToRoleConfigKey][messageId].anyReactionRoleId = role.id;
        }
        this.writeConfig(this._reactionToRoleConfigKey);
        return interaction.replySuccess(`Linked the role ${role.toString()} with ${emoji ? `${emoji}` : 'any emoji'} for message ${messageLink}`);
    }   

    async removeMessageRole(interaction, messageLink, messageId, role, emoji, anyReaction) {
        if (!this.configs[this._reactionToRoleConfigKey][messageId]) {
            return interaction.replyError(`No reaction to role configuration found for message ${messageLink}`);
        }

        if (!emoji && !role && !anyReaction) {
            // If no other argument is given, delete the message
            delete this.configs[this._reactionToRoleConfigKey][messageId];
            this.writeConfig(this._reactionToRoleConfigKey);
            return interaction.replySuccess(`Deleted configuration for message ${messageLink}`);

            const message = await interaction.channel.messages.fetch(messageId);
            try {
                for (const reaction of message.reactions.values()) {
                    reaction.users.remove(interaction.client.user.id);
                }
            } catch (err) {
                this.logger.warn(`Failed to remove reaction ${emojiName}: ${err}`);
            }
        }

        // If an emoji or a role is given (or both), remove every occurence on the message
        const roleId = role ? role.id : undefined;       
        const successParts = [];
        const errorParts = [];
        if (emoji || roleId) {
            let emojiFound = !emoji;
            let roleFound = !roleId;
            const message = await interaction.channel.messages.fetch(messageId);

            for (const [emojiName, roleID] of Object.entries(this.configs[this._reactionToRoleConfigKey][messageId].emojisToRoles)) {
                if (emojiName === emoji || roleID === roleId) {
                    delete this.configs[this._reactionToRoleConfigKey][messageId].emojisToRoles[emojiName];

                    successParts.push(`${emojiName} → ${getRoleName(interaction.guild, roleID)}`);

                    if (emojiName === emoji) { emojiFound = true }
                    if (roleID === roleId) { roleFound = true }

                    // Remove the corresponding emoji from the reactions
                    try {
                        const reaction = message.reactions.cache.get(emojiName);
                        if (reaction) {
                            reaction.users.remove(interaction.client.user.id);
                        }
                    } catch (err) {
                        this.logger.warn(`Failed to remove reaction ${emojiName}: ${err}`);
                    }
                }
            }

            if (emoji && !emojiFound) {
                errorParts.push(`Emoji "${emoji}" not found`);
            }

            if (role && !roleFound) {
                errorParts.push(`Role ${role.toString} not found`);
            }
        }
        // If a anyReaction is true, delete the current role setup for any reaction
        let removedAnyEmoji = '';
        if (anyReaction && this.configs[this._reactionToRoleConfigKey][messageId].anyReactionRoleId) {
            const anyReactionRoleId = this.configs[this._reactionToRoleConfigKey][messageId].anyReactionRoleId;
            removedAnyEmoji = getRoleName(interaction.guild, anyReactionRoleId);
            this.configs[this._reactionToRoleConfigKey][messageId].anyReactionRoleId = undefined;
        }

        this.writeConfig(this._reactionToRoleConfigKey);        

        if (successParts.length === 0) {
            return interaction.replyError(
                `No changes were made.\n` +
                (errorParts.length ? `- ${errorParts.join('\n- ')}` : `Nothing matched your request.`)
            );
        }

        return interaction.replySuccess(
            `Removed the following emoji-role mappings:\n- ${successParts.join('\n- ')}` +
            (removedAnyEmoji ? `\nRemoved "any reaction" role: ${removedAnyEmoji}` : '') +
            (errorParts.length ? `\n⚠️ Not applied:\n- ${errorParts.join('\n- ')}` : '')
        );
    }

    async viewMessageConfig(interaction, messageLink, messageId) {
        if (!this.configs[this._reactionToRoleConfigKey][messageId]) {
            return await interaction.replyError(`No reaction to role configuration found for message ${messageLink}`);
        }
        const baseConfig = this.configs[this._reactionToRoleConfigKey][messageId];

        const context = {
            messageLink: messageLink,
            emojisToRoles: Object.entries(baseConfig.emojisToRoles).map(([emoji, roleId]) => { return { emoji: emoji, role: getRoleName(interaction.guild, roleId) } }),
            anyReactionRole: getRoleName(interaction.guild, baseConfig.anyReactionRoleId)
        }
        const template = await this.importTemplate('view_message');

        return interaction.replyWithEmbed([renderEmbed(template, context)], true);
    }
    // #endregion Commands

    getEmojiName(emoji) {
        if (emoji && emoji.includes(':')) {
            return emoji.split(':')[1]; // Get the emoji name without the ID if it's a custom emoji
        }
        return emoji;
    }

    isRoleManagable(guild, role) {
        const botHighestRole = guild.members.me.roles.highest;
        return role && role.comparePositionTo(botHighestRole) < 0;
    }

    // #region Events
    async add_role(reaction, user) {
        if (!user || user.bot || user.system) { return; };

        const setUpData = await this.setUpRoleModification(reaction, user.id);
        if (!setUpData) { return; }
        const { member, emojiRole, anyReactionRole } = setUpData;

        try {
            // If there is a anyReaction role associated with the message, add it
            if (anyReactionRole && !member.roles.cache.has(anyReactionRole.id)) {
                await member.roles.add(anyReactionRole);
                this.logger.info(`Added role ${anyReactionRole.name} to user ${member.user.tag}`);
            }

            // If there is a role associated with the emoji, add it to the member
            if (emojiRole) {
                await member.roles.add(emojiRole);
                this.logger.info(`Added role ${emojiRole.name} to user ${member.user.tag}`);
            }
        } catch (error) {
            this.logger.error(`Role ${emojiRole.id} attribution : ${error}`);
        }
    }

    async remove_role(reaction, user) {
        if (!user || user.bot || user.system) { return; };

        const setUpData = await this.setUpRoleModification(reaction, user.id);
        if (!setUpData) { return; }
        const { member, emojiRole, anyReactionRole } = setUpData;

        try {
            if (anyReactionRole) {
                // Check if the user has another reaction on the message
                let hasReacted = false;

                for (const messageReaction of reaction.message.reactions.cache.values()) {
                    // Skip the reaction being removed
                    if (messageReaction.emoji.name === reaction.emoji.name ) { continue; }
                    const users = await messageReaction.users.fetch();

                    if (users.has(user.id)) {
                        hasReacted = true;
                        break;
                    }
                }

                if (!hasReacted) {
                    await member.roles.remove(anyReactionRole);
                    this.logger.info(`Removed role ${anyReactionRole.name} from user ${member.user.tag}`);
                }
            }

            // If there is a role associated with the emoji, remove it from the member
            if (emojiRole) {
                await member.roles.remove(emojiRole);
                this.logger.info(`Removed role ${emojiRole.name} from user ${member.user.tag}`);
            }
        } catch (error) {
            this.logger.error(`Role ${emojiRole.id} removal : ${error}`);
        }
    }

    async fetchMessages(client) {
        for (const [messageId, config] of Object.entries(this.configs[this._reactionToRoleConfigKey])) {
            const channel = client.channels.cache.get(config.channelId);

            try {
                await channel.messages.fetch(messageId);
                this.logger.info(`Successfully fetched message ${messageId}`);
            } catch (error) {
                this.logger.error(`Fetching the message ${messageId}: ${error.message}`);
            }
        }
    }
    // #endregion Events

    async waitForPartialReaction(reaction) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (fetchError) {
                throw new Error(`Failed to fetch partial reaction: ${fetchError}`);
            }
        }
    }

    getRoles(messageId, emojiName, guild) {
        const messageData = this.configs[this._reactionToRoleConfigKey][messageId];
        if (!messageData) { return undefined; }

        const emojiRoleId = messageData.emojisToRoles[emojiName];
        if (!emojiRoleId && !messageData.anyReactionRoleId) {
            this.logger.warn(`No global role and no role associated with emoji ${emojiName} for message ${messageId}`);
            return undefined;
        }

        let emojiRole = guild.roles.cache.get(emojiRoleId);
        let anyReactionRole = guild.roles.cache.get(messageData.anyReactionRoleId);

        if (!emojiRole && !anyReactionRole) { 
            this.logger.error(`Didn't find ${emojiRoleId ? `role with ID ${emojiRoleId}${messageData.anyReactionRoleId? ' and ' : ''}` : ''}${messageData.anyReactionRoleId ? `anyReaction role with ID ${messageData.anyReactionRoleId}` : ''}`);
            return undefined;
        }
        
        // Check if the bot has the permissions to manage the role
        if (emojiRole && !this.isRoleManagable(guild, emojiRole)) {
            this.logger.error(`Bot's highest role is not high enough to manage the role ${emojiRole.name}`);
            emojiRole = undefined;;
        }
        if (anyReactionRole && !this.isRoleManagable(guild, anyReactionRole)) {
            this.logger.error(`Bot's highest role is not high enough to manage the role ${anyReactionRole.name}`);
            anyReactionRole = undefined;
        }

        return { emojiRole, anyReactionRole };
    }

    async getMember(guild, userId) {
        // Get member
        const member = await guild.members.fetch(userId);
        if (!member) {
            this.logger.error(`Fetching member with ID ${userId} in guild ${guild.id}`);
            return undefined;
        }
        return member;
    }

    async setUpRoleModification(reaction, userId) {
        // When reaction added, wait for all informations
        await this.waitForPartialReaction(reaction);

        // Get the role to add and the anyReaction role if exists
        const roles = this.getRoles(reaction.message.id, reaction.emoji.name, reaction.message.guild);
        if (!roles) { return undefined; }
        const { emojiRole, anyReactionRole } = roles;

        // Get guild member
        const member = await this.getMember(reaction.message.guild, userId);
        if (!member) { return undefined; }

        return { member, emojiRole, anyReactionRole };
    }
}
