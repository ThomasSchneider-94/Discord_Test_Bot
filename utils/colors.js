/// Base colors
export const HEX_COLOR_MAP = {
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

/// Colors handling utilities
export function getHexaColor(colorString) {
    if (!colorString) { return; }

    const color = HEX_COLOR_MAP[colorString.toLowerCase()];
    if (color) { return color; }

    if (/^#[0-9a-f]{6}$/i.test(colorString)) {
        return colorString.toLowerCase();
    }
    return;
}

export function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

export function rgbToHex(rgb) {
    return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}
