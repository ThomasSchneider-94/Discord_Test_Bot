import { updateConfig } from '../../config.js';
import { moduleName } from './__init__.js';

/// CONSTANT
export const DICE_FILES = ['d4.png', 'd6.png', 'd8.png', 'd10.png', 'd12.png', 'd20.png'];
export const DICE_VALUES = [4, 6, 8, 10, 12, 20];

export const AUTO_COMPLETE_COLOR_HEX = {
    'black': '#000000',
    'grey': '#808080',
    'white': '#ffffff',
    'red': '#ff0000',
    'orange': '#ff7f00',
    'yellow': '#ffff00',
    'light green': '#7fff00',
    'green': '#00ff00',
    'light blue': '#00ffff',
    'cyan': '#007fff',
    'blue': '#0000ff',
    'purple': '#7f00ff',
    'pink': '#ff00ff'
};

export const BASE_COLOR_DIRECTORY = '#ffffff';

export const NUMBER_SPACING = 2;
export const NUMBER_MAX_WIDTH = 150;
export const MAX_DICE_PER_LINE = 10;

/// FUNCTION
export function getHexaColor(color) {
    if (!color) { return false; }
    for (const [name, hex] of Object.entries(AUTO_COMPLETE_COLOR_HEX)) {
        if (name.toLowerCase() === color.toLowerCase()) {
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
