// ========== BIBLIOTHÈQUES ==========
const fs = require('fs');
const path = require('path');

// ========== PARAMETRAGES DU BOT DISCORD ==========

// Token du bot
const { token } = require('./config.json');

const { Client, Collection, Intents, GatewayIntentBits, Partials } = require('discord.js');

// Création d'un nouveau client
const client = new Client({
	//intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, Intents.FLAGS.GUILDS, ],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
	partials: [Partials.MESSAGE, Partials.CHANNEL, Partials.REACTION],
});

// Récupération des fichiers liés aux events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

// client.commands = new Collection();
// const commandsPath = path.join(__dirname, 'slashCommands');
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// // for (const file of commandFiles) {
// // 	const filePath = path.join(commandsPath, file);
// // 	const command = require(filePath);

// // 	// Set a new item in the Collection with the key as the command name and the value as the exported module
// // 	if ('data' in command && 'execute' in command) {
// // 		client.commands.set(command.data.name, command);
// // 		console.log(`Ajout de la commande ${command.data.name} à la collection`);
// // 	} else {
// // 		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// // 	}
// // }

// // client.on(Events.InteractionCreate, interaction => {
// // 	if (!interaction.isChatInputCommand()) return;
// // 	console.log(interaction);
// // });



client.login(token)