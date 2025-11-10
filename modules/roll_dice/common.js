import { updateConfig } from '../../config.js';
import { moduleName } from './__init__.js';

/// CONSTANT
export const DICE_FILES = ['d4.png', 'd6.png', 'd8.png', 'd10.png', 'd12.png', 'd20.png'];
export const DICE_VALUES = [4, 6, 8, 10, 12, 20];

export const AUTO_COMPLETE_COLOR_NAMES = [
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

const AUTO_COMPLETE_COLOR_HEX = {
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

export const BASE_COLOR_DIRECTORY = '#ffffff';

export const NUMBER_SPACING = 2;
export const NUMBER_MAX_WIDTH = 150;
export const MAX_DICE_PER_LINE = 10;

/// FUNCTION
export function getHexaColor(color) {
    for (const [name, hex] of Object.entries(AUTO_COMPLETE_COLOR_HEX)) {
        if (name === color) {
            return hex;
        }
    }

    if (/^#[0-9a-f]{6}$/i.test(color)) {
        return color.toLowerCase();
    }
    return false;
}

export function savePlayerConfig(userId, updateValue) {
    updateConfig(moduleName, 'playerConfig', userId, updateValue, true);
}

export function mapImagesHorizontaly(images, spacing = 0) {
    let offsetX = 0;

    return images.map(img => {
        const layer = {
            input: img.data,
            top: 0,
            left: offsetX
        };
        offsetX += (img.info.width + spacing);
        return layer;
    });
}
