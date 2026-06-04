import { SlashCommandBuilder } from 'discord.js';
import { patch } from '#utils'

patch(Guild.prototype, {
	commands['help'] = {
		commandBluider: new SlashCommandBuilder()
			.setName('help')
			.setDescription('Display module or command description')
			.addStringOption(option =>
				option.setName('module')
					.setDescription('Get module description')
					.setAutocomplete(true)
			)
    		.addStringOption(option =>
				option.setName('command')
					.setDescription('Get command description')
					.setAutocomplete(true)
			),
		autocomplete: {
			"module": this.allModules,
			"command": { function: this.commandByModule, args: [module] }
		},
		description: 'Display information about a command, module or general information about the bot if no argument is provided.',
		args: [
            { name: 'module', required: true, description: 'Name of the module you want info on. Can also be used to filter the commands autocomplete.' },
            { name: 'command', description: 'Name of the command you want info on. If multiple modules provide the command, use the format `command (module)`.' },
        ]
	}
)
