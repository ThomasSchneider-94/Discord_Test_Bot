import { default as sharp } from 'sharp';

export async function loadImage(file) {
	return await sharp(file).png().toBuffer({ resolveWithObject: true });
}

export async function loadImages(imageFiles) {
	return await Promise.all(
        imageFiles.map(async file => {
            return await sharp(file).toBuffer({ resolveWithObject: true });
        })
    );
}

export async function render(image) {
	return await sharp(image.data).png().toBuffer();
}

export async function overlayOnBackground(backgroundImage, topImages, gravity='center') {
    return await Promise.all(
        topImages.map(async topImage => {
            const image = sharp(backgroundImage.data)
                .composite([
                    {
                        input: topImage.data,
                        gravity: gravity
                    }
                ]);
            const info = await image.metadata();
            const data = await image.toBuffer();
            return { data, info };
        })
    );
}

export async function concatImageHoryzontal(images, spacing=0, maxWidth=undefined, minWidth=undefined) {
	let width = images.reduce((sum, img) => sum + img.info.width, 0) + spacing * (images.length - 1);
    const height = images.reduce((max, img) => Math.max(max, img.info.height), 0);

    if (minWidth && width < minWidth) {
        width = minWidth;
    }
    
    let offset = 0;
    const imageBuffer = sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(images.map(image => {
        const layer = { input: image.data, top: 0, left: offset }
        offset += (image.info.width + spacing);
        return layer;
    })).png().toBuffer();
    
    const image = sharp(await imageBuffer);
    if (maxWidth && width > maxWidth) {
		image = image.resize({width: maxWidth});
    }
	return await image.toBuffer({ resolveWithObject: true });
}

export async function concatImageVertically(images, spacing=0, maxHeight=undefined, minHeight=undefined) {
	const width = images.reduce((max, img) => Math.max(max, img.info.width), 0);
    let height = images.reduce((sum, img) => sum + img.info.height, 0) + spacing * (images.length - 1);

    if (minHeight && height < minHeight) {
        height = minHeight;
    }

    let offset = 0;
    const imageBuffer = sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    }).composite(images.map(image => {
        const layer = { input: image.data, top: offset, left: 0 }
        offset += (image.info.height + spacing);
        return layer;
    })).png().toBuffer();
    
    const image = sharp(await imageBuffer);
    if (maxHeight && height > maxHeight) {
		image = image.resize({height: maxHeight});
    }
	return await image.toBuffer({ resolveWithObject: true });
}

export async function replaceColor(image, baseColor, replacementColor) {
	if (baseColor == replacementColor) {
		return image;
	}

	/// Take RGB color as argument
	const { data, info } = await asSharp(image).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
        
    // Color all parts of the dice
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] == baseColor.r && data[i + 1] == baseColor.g && data[i + 2] == baseColor.b && data[i + 3] > 0) {
            data[i] = replacementColor.r;
            data[i + 1] = replacementColor.g;
            data[i + 2] = replacementColor.b;
        }
    }

	return {data: await sharp(data, { raw: info }).png().toBuffer(), info};
}

function asSharp(image) {
    return sharp(image.data);
}