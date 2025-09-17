import { Events } from 'discord.js';
import { configFiles } from '../../../config.js';

export const name = Events.MessageReactionRemove;
export const once = false;

export async function execute(reaction, user) {
    const { reactionToRole } = configFiles.reaction_to_role;

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
                    const roleToRemove = guild.roles.cache.find(role => role.id === emojiToRole.role || role.name === emojiToRole.role);
                    if (roleToRemove) {

                        // Remove the role from the user 
                        try {
                            await member.roles.remove(roleToRemove);
                            console.log(`Role ${roleToRemove.name} removed from ${user.username}.`);
                            await member.fetch();
                        } catch (error) {
                            throw new Error(`Error during role removal ${roleToRemove.role} : ${error}`);
                        }                    

                        if (message.generalRole) {
                            // Check if the user has no other role in the category                            
                            const roles_name = member.roles.cache.map(role => role.name);
                            const roles_id = member.roles.cache.map(role => role.id);

                            if (!message.emojisToRoles.some(emojiToRole => roles_id.includes(emojiToRole.role) || roles_name.includes(emojiToRole.role))) {

                                const generalRoleToRemove = guild.roles.cache.find(role => role.id === message.generalRole || role.name === message.generalRole);
                                if (generalRoleToRemove) {
                                
                                    // Remove the general role
                                    try {
                                        await member.roles.remove(generalRoleToRemove);
                                        console.log(`Role ${generalRoleToRemove.name} removed from ${user.username}.`);
                                        await member.fetch();
                                    } catch (error) {
                                        throw new Error(`Error during role ${generalRoleToRemove.role} removal : ${error}`);
                                    }
                                }
                                else {
                                    throw new Error(`Cannot find role ${message.generalRole}`);
                                }
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
