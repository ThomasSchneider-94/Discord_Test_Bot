import { updateConfig } from '../../config.js';
import { moduleName } from './__init__.js';

export const diceFiles = ['d4.png', 'd6.png', 'd8.png', 'd10.png', 'd12.png', 'd20.png'];

export function savePlayerConfig(userId, updateValue) {
    updateConfig(moduleName, 'playerConfig', userId, updateValue, true);
}

export const autoCompleteColorNames = [
    'Black',       // #000000
    'Grey',        // #808080
    'White',       // #ffffff
    'Red',         // #ff0000
    'Orange',      // #ff7f00
    'Yellow',      // #d1d1bdff
    'Light Green', // #7fff00
    'Green',       // #00ff00
    'Light Blue',  // #00ffff
    'Cyan',        // #007fff
    'Blue',        // #0000ff
    'Purple',      // #7f00ff
    'Pink'         // #ff00ff
    ];

const autoCompleteColorHex = {
    'Black': '#000000',
    'Grey': '#808080',
    'White': '#ffffff',
    'Red': '#ff0000',
    'Orange': '#ff7f00',
    'Yellow': '#ffff00',
    'Light Green': '#7fff00',
    'Green': '#00ff00',
    'Light Blue': '#00ffff',
    'Cyan': '#007fff',
    'Blue': '#0000ff',
    'Purple': '#7f00ff',
    'Pink': '#ff00ff'
};

export function getHexaColor(color) {
    for (const [name, hex] of Object.entries(autoCompleteColorHex)) {
        if (name === color) {
            return hex;
        }
    }

    if (/^#[0-9a-f]{6}$/i.test(color)) {
        return color.toLowerCase();
    }
    return false;
}