const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        if (!(message.author.bot)) {

            
            console.log("Ceci n'est pas un bot")
            console.log(message.editable)
            message.reply("Bonsoir")
        }
    },
}; 