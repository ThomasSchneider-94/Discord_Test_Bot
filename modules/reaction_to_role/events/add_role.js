import { Events } from 'discord.js';

import { config } from '../../../config.js';

export const name = Events.MessageReactionAdd;
export const once = false;

export async function execute(reaction, user) {
    const { reactionToRole } = config.reaction_to_role;

    try {
        // When reaction added, wait for all informations
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (fetchError) {
                throw new Error(`Failed to fetch partial reaction: ${fetchError}`);
            }
        }       
        
        const message = reactionToRole.find(message => message.messageId === reaction.message.id);
        if (message) {

            const emojiToRole = message.emojisToRoles.find(emojiToRole => emojiToRole.emoji == reaction.emoji.name)
            if (emojiToRole) {

                 // Get user
                const guild = reaction.message.guild;
                const member = await guild.members.fetch(user.id);
                if (member) {

                    // Get the role to add
                    const roleToAdd = guild.roles.cache.find(role => role.id === emojiToRole.role || role.name === emojiToRole.role);
                    if (roleToAdd) {

                        // Grant the role to the user
                        try {
                            await member.roles.add(roleToAdd);
                            console.log(`Role ${roleToAdd.name} granted to ${user.username}.`);
                            await member.fetch();
                        } catch (error) {
                            throw new Error(`Error during role ${roleToAdd.name} attribution : ${error}`);
                        }

                        // If there is a general role, add it to the user if it does not have it
                        if (message.generalRole && !(member.roles.cache.some(role => role.id === message.generalRole || role.name === message.generalRole))) {

                            const generalRoleToAdd = guild.roles.cache.find(role => role.id === message.generalRole || role.name === message.generalRole);
                            if (generalRoleToAdd) {
                                
                                // Grant the general role
                                try {
                                    await member.roles.add(generalRoleToAdd);
                                    console.log(`Role ${generalRoleToAdd.name} granted to ${user.username}.`);
                                    await member.fetch();
                                } catch (error) {
                                    throw new Error(`Error during role ${generalRoleToAdd.role} attribution : ${error}`);
                                }
                            }
                            else {
                                throw new Error(`Cannot find role ${message.generalRole}`);
                            }
                        }
                    }
                    else {
                        throw new Error(`Cannot find role ${emojiToRole.role}`);
                    }
                }
                else {
                    throw new Error(`Cannot find user ${user.username}`);
                }
            }
        }
    } catch (error) {
        console.error(`reaction_to_role - : ${error}` );
    }
}
