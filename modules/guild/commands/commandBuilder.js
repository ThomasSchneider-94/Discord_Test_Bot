import { SlashCommandBuilder } from 'discord.js';


export const commandOptions = {
    
}

export class CommandBuilder {
    constructor()

  
}


export const commandOptions = {
    Attachment: CommandAttachmentOptionBuilder,
    Boolean: CommandBooleanOptionBuilder,
    Channel = CommandChannelOptionBuilder,
    Integer = CommandIntegerOptionBuilder,
    Mentionable = CommandMentionableOptionBuilder,
    Number = CommandNumberOptionBuilder,
    Role = CommandRoleOptionBuilder,
    String = CommandStringOptionBuilder,
    User = CommandUserOptionBuilder
}


export class CommandOptionBuilder {
    construtor(name, description, verboseDescription, required = false) {
        this.name = name;
        this.description = description;
        this.fullDescription = verboseDescription;
        this.required = required === true;
    }

    get option() {
        
    }

    merge(commandOption) {
        
    }

    get command() {
        return .setName(this.name).setDescription(this.description).setRequired(required);
    }

    get build() {
        return new this.class.
    }
}

class CommandAttachmentOption extends CommandOptionBuilder {
    type = 'attachment';
    class = SlashCommandAttachmentOption();
}

class CommandBooleanOption extends CommandOptionBuilder {
}

class CommandChannelOption extends CommandOptionBuilder {
    constructor(name, description = '', verboseDescription = '', required = false, channelTypes = undefined) {
        super(name, description, verboseDescription, required);
        this.channelTypes = channelTypes;
    }

    get command() {
        return super.command.
    }
 }

class CommandIntegerOption extends CommandOptionBuilder {
    constructor(name, description = '', verboseDescription = '', required = false, minValue = -Infinity, maxValue = Infinity, choices = {}, autocomplete = false) {
        super(name, description, verboseDescription, required);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.choices = choices;
        this.required = autocomplete === true;
    }
}

class CommandMentionableOption extends CommandOptionBuilder {
}

class CommandNumberOption extends CommandOptionBuilder {
    constructor(name, description = '', verboseDescription = '', required = false, minValue = -Infinity, maxValue = Infinity, choices = {}, autocomplete = false) {
        super(name, description, verboseDescription, required);
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.choices = choices;
        this.required = autocomplete === true;
    }
}

class CommandRoleOption extends CommandOptionBuilder {
}

class CommandStringOption extends CommandOptionBuilder {
    constructor(name, description = '', verboseDescription = '', required = false, minLength = 0, maxLength = 1000, choices = {}, , autocomplete = false) {
        super(name, description, verboseDescription, required);
        this.minLength = minLength;
        this.maxLength = maxLength;
        this. choices = choices;
        this.required = autocomplete === true;
    }
}

class CommandUserOption extends CommandOptionBuilder {
}
