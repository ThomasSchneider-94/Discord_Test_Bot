const discord = require("discord.js");
const client = new discord.Client();

let guildArray = client.guilds.array();






import { Events } from 'discord.js';

export const name = Events.GuildCreate;
export const once = false;

export async function execute(interaction) {
    if (interaction.isChatInputCommand()) {
        executeCommand(interaction);
    }
    else if (interaction.isAutocomplete()) {
        autocompleteCommand(interaction);
    }
    else {
        logWarning(`Received non-command interaction: ${interaction.commandName}`);
    }	
};

















//joined a server
client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name);
    //Your other stuff like adding to guildArray
})

//removed from a server
client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name);
    //remove from guildArray
})