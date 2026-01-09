import { EmbedBuilder } from 'discord.js';

const setters = {
    title: 'setTitle',
    description: 'setDescription',
    color: 'setColor',
    url: 'setURL',
    thumbnail: 'setThumbnail',
    image: 'setImage',
    footer: 'setFooter',
    author: 'setAuthor'
};

function resolve(value, context) {
    return typeof value === 'function' ? value(context) : value;
}

function normalize(key, value) {
    if (key === 'footer' && typeof value === 'string') {
        return { text: value };
    }

    if (key === 'author' && typeof value === 'string') {
        return { name: value };
    }

    return value;
}

export function renderEmbed(template, context) {
    const embed = new EmbedBuilder();

    for (const [key, setter] of Object.entries(setters)) {
        if (template[key] !== undefined) {
            embed[setter](normalize(key, resolve(template[key], context)));
        }
    }

    if (template.fields) {
        const fields = resolve(template.fields, context);
        if (fields?.length) embed.addFields(fields);
    }

    return embed;
}