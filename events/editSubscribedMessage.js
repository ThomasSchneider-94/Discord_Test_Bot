const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message, client) {
        if (message.author.id != client.user.id) {
            
            console.log(message);


            if (message.guild) {
                // Get the content of the message
                const messageContent = message.content;
                
                // Log the content of the message
                console.log('Received message:', messageContent);
            }


            const messageContent = message.content;
            console.log(messageContent);
            if (message.content) {
                console.log("pong");
                const channel = message.channel;
                channel.send("pong");
            }
        }
    },
};