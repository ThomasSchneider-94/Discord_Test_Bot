import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'roll_dice',
    author: 'Thomas Schneider',
    displayName: 'Roll Dice',
    description: 'Module for rolling dice and managing dice-related actions.',
    class: 'RollDice',
    permissions: [
        PermissionFlagsBits.AttachFiles
    ],
    configs: [
        'playerSettings.json',
        'resultDisplay.json'
    ],
    commands: [
        { 
            file: 'roll.js',
            name: 'roll', 
            description: 'Roll a set of dice.',
            args: [
                { name: 'dice', description: 'Value of the dice to roll: 6, 10, 20... Default value can be configured with `/set-dice`.' },
                { name: 'count', description: 'Number of dice to roll. Default is 1.' },
                { name: 'modifier', description: "Modifier, positive or negative, to apply to the roll's total." },
                { name: 'color', description: 'Color of the dice. Use the preset colors or hexadecimal color. Default value can be configured with `/set-dice`' },
            ]
        },
        { 
            file: 'fast_roll.js',
            name: 'froll', 
            description: 'Roll multiples sets of dice in one argument.',
            args: [
                { name: 'args', required: true, description: 'Use the [Die count]d[Die value] format, and separe each group by blanck space. Add modifier with +/-. Default dice value and color can be configured with `/set-dice`' }
            ]
        },
        { 
            file: 'set_dice.js',
            name: 'set-dice', 
            description: "Configure a player's default dice value or/and default color.",
            args: [
                { name: 'color', description: 'Default color of the dice when not specified. Use the preset colors or hexadecimal color.' },
                { name: 'value', description: 'Default value of the dice to roll when not specified.' }
            ]
        },
        { 
            file: 'roll_display.js',
            name: 'roll-display', 
            description: "Configure the results display after a dice roll.",
            args: [
                { name: 'list', description: 'Display the list of all dice result.' },
                { name: 'value', description: "Return the roll's successes." },
                { name: 'visual', description: 'Display an image with all dice results.' }
            ]
        }
    ]
};
