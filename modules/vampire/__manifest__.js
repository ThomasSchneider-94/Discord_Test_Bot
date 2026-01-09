import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'vampire',
    override: 'roll_dice',
    author: 'Thomas Schneider',
    displayName: 'Vampire',
    description: 'Extension of Roll Dice module featuring the rules of Vampire the Mascarade.',
    class: 'Vampire',
    configs: [
        'playerSettings.json'
    ],
    commands: [
        { 
            file: 'roll.js',
            name: 'roll', 
            description: 'Roll a set of dice.',
            args: [
                { name: 'dice', description: 'Value of the dice to roll: 6, 10, 20... Default is 10.' },
                { name: 'count', description: 'Number of dice to roll. Default is 1.' },
                { name: 'modifier', description: "Modifier, positive or negative, to apply to the roll's total." },
                { name: 'color', description: 'Color of the dice. Use the preset colors or hexadecimal color. Default value can be configured with `/set-hunger`' },
                { name: 'hunger', description: 'Number of hunger dice included in the roll. Can be set with /set-hunger' },
                { name: 'hunger-color', description: 'Color of the hunger dice. Use the preset colors or hexadecimal color. Default value can be configured with `/set-hunger`' },
            ]
        },
        { 
            file: 'fast_roll.js',
            name: 'froll', 
            description: 'Roll multiples sets of dice in one argument.',
            args: [
                { name: 'args', required: true, description: 'Use the [Die count]d[Die value]h[Hunger dice] format, and separe each group by blanck space. Add modifier with +/-.' }
            ]
        },
        { 
            file: 'willpower.js',
            name: 'willpower', 
            description: "Reroll previous roll."
        },
        { 
            file: 'rouse.js',
            name: 'rouse', 
            description: "Roll a rouse check.",
            args: [
                { name: 'count', description: 'How many rouse check to roll.' },
                { name: 'multi-roll', description: "Considered as success if at least one success. Default is false" },
                { name: 'track-hunger', description: 'Increase the hunger value in case of failure. Default is True' }
            ]
        },        
        { 
            file: 'set_hunger.js',
            name: 'set-hunger', 
            description: "Configure a player's default dice value or/and default color.",
            args: [
                { name: 'count', description: 'Number of hunger dice ot include in rolls.' }
                { name: 'color', description: 'Color of hunger dice.' },
                { name: 'normalColor', description: 'Color of base dice.' },
            ]
        },
        
    ]
};
