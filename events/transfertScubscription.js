const { Events, WebhookClient } = require('discord.js');

// URL du Webhook
const { webhookURL } = require('../config.json');
const webhookClient = new WebhookClient({ url: webhookURL });

const { receptionChannel } = require('./configTransfertSubscriptions.json');
const { serverBots } = require('./configTransfertSubscriptions.json');
const { rolesEquivalents } = require('./configTransfertSubscriptions.json');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message, client) {
        // Si c'est un autre utilisateur que le bot
        if (message.author.id != client.user.id) {

            // Si c'est un autre utilisateur que le webhook
            if (message.author.id != webhookClient.id) {

                // On vérifie que le message vient bien du channel voulu
                if (message.channel.id == receptionChannel) {
                    
                    // On regarde que ce soit bien un serveur enregistré par le bot
                    let found = false;
                    let serverInformations;

                    for (serverBot of serverBots) {

                        if (serverBot.id == message.author.id) {
                            serverInformations = serverBot;
                            found = true
                            break
                        }
                    }

                    if (found === true) {
                        console.log("FOUND !!")
                        
                        // Personnalise l'apparence du Webhook pour qu'il prenne celle du server qui publie
                        await webhookClient.edit({
                            name: serverInformations.name,
                            avatar: serverInformations.avatar,
                        })
                        
                        // Retouche le message pour inclure les pings des rôles concernés
                        let messageContent = message.content;
                        let i = 0;
                        while (i < messageContent.length) {
                            // Si on détecte un @ dans le message
                            if (messageContent[i] == "@") {
                                console.log("Potential role found");                                
                                
                                // On verifie tous les rôles possibles des serveurs auquels nous sommes aboné
                                for (rolesEquivalent of rolesEquivalents) {
                                    for (equivalent of rolesEquivalent.equivalences) {

                                        if (messageContent.substr(i+1, equivalent.length) == equivalent) {
                                            // Si il s'agit bien d'un rôle d'un autre serveur, on remplace par l'équivalent sur notre serveur
                                            messageContent = messageContent.replace(messageContent.substr(i, equivalent.length+1), rolesEquivalent.serverRole)
                                            i += equivalent.length;
                                            break
                                        }
                                    }
                                }
                            }
                            i ++;
                        }
                        
                        // On rajoute le rôle qui correspond au server abonné
                        messageContent = serverInformations.roleToPing + "\n\n" + messageContent;                        

                        // Et on envoie
                        webhookClient.send(messageContent)
                        .then(() => console.log('Message sent successfully!'))
                        .catch(console.error);
                    }
                    else {
                        console.log("Server Bot haven't been found")
                    }
                }
            }
        }
    },
};