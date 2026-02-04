import { updateConfig } from '../../config.js';
import { moduleName } from './__init__.js';
import { getModuleData, hexToRgb, logInfo } from '../../utils.js';
import { LRUCache } from '../../utils/LRUCache.js';
import { default as sharp } from 'sharp';

/// CONSTANT
export const DICE_FILES = ['d4.png', 'd6.png', 'd8.png', 'd10.png', 'd12.png', 'd20.png'];
export const DICE_VALUES = [4, 6, 8, 10, 12, 20];

export const NUMBER_SPACING = 2;
export const NUMBER_MAX_WIDTH = 150;
export const MAX_DICE_PER_LINE = 10;
export const BASE_COLOR = '#ffffff';

const diceCache = new LRUCache(20); // Cache for colored dice images

/// FUNCTION

export async function colorDie(die, color, hex=false, useCache=true) {
	if (hex) {
		color = hexToRgb(color);
	}

	if (useCache && diceCache.has(`${die}-${color.r},${color.g},${color.b}`)) {
		//logInfo(`Cache hit for ${die}-${color.r},${color.g},${color.b}`);
		return diceCache.get(`${die}-${color.r},${color.g},${color.b}`);
	}

	const { data, info } = await sharp(getModuleData(moduleName, 'dice', die))
										.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
	
	for (let i = 0; i < data.length; i += 4) {
		if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255 && data[i + 3] == 255) {
			data[i] = color.r;
			data[i + 1] = color.g;
			data[i + 2] = color.b;
		}
	}

	const colorDie = {data: await sharp(data, { raw: info }).png().toBuffer(), info};
	if (useCache) {
		//logInfo(`Cache set for ${die}-${color.r},${color.g},${color.b}`);
		diceCache.set(`${die}-${color.r},${color.g},${color.b}`, colorDie);
	}

	return colorDie;
}

export function savePlayerConfig(userId, updateValue) {
    updateConfig(moduleName, 'playerConfig', userId, updateValue, true);
}

export function mapImages(images, horizontal, maxPerLine, x_spacing = 0, y_spacing = 0) {
    let offsetX = 0;
    let offsetY = 0;

	return images.map((img, i) => {
        const layer = {
            input: img.data,
            top: offsetY,
            left: offsetX
        };

		if (horizontal) {
			offsetX += (img.info.width + x_spacing);

			if (i % maxPerLine == maxPerLine - 1) {
				offsetX = 0;
				offsetY += img.info.height + y_spacing;
			}
		}
		else {
			offsetY += (img.info.height + y_spacing);

			if (i % maxPerLine == maxPerLine - 1) {
				offsetY = 0;
				offsetX += (img.info.width + x_spacing);
			}
		}
    	return layer;
	});
}
