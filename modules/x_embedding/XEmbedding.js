import { Module } from '#modules/guild/models/Module.js';
import { manifest } from './__manifest__.js';

import { Cache } from '#utils';

export default class XEmbedding extends Module {
	constructor(guildId, guildName) {
		super(manifest, guildId, guildName);

    	this.lastLinks = new Cache(5);
	}

  	// #region Events
  	async replyLink(message) {
    	if (!this.isValidLink(message.content)) { return; }

		await message.suppressEmbeds(true);
    	const response = await message.reply({ content: this.generateLinks(message.content), allowedMentions: { repliedUser: false } });
		this.lastLinks.set(message.id, response);
  	}

  	async modifyLink(oldMessage, newMessage) {
		const response = this.lastLinks.get(oldMessage.id);
		if (!response) return;

    	if (this.isValidLink(newMessage.content)) { // Replace with the new link
			try {
				await newMessage.suppressEmbeds(true);
				await response.edit({ content: this.generateLinks(newMessage.content), allowedMentions: { repliedUser: false } });
			} catch (error) {
				if (error.code === 10008) {
                	// Message no longer exists → clean cache
                	this.lastLinks.delete(oldMessage.id);
				}
				else {
                	throw error;
            	}
			}
    	}
    	else { // Delete if no longer a twitter link
			await this.deleteLink(oldMessage);
    	}
  	}

  	async deleteLink(message) {
		const response = this.lastLinks.get(message.id);
		if (!response) return;

		try {
        	await response.delete();
    	} catch (error) {
        	if (error.code !== 10008) {
           		throw error;
        	}
        	// else: already deleted → ignore
    	}
		this.lastLinks.delete(message.id);
  	}
  	// #region Events

	isValidLink(content) {
		return /https:\/\/(twitter\.com|x\.com)\//.test(content)
	}

	generateLinks(content) {
		return extractTwitterLinks(content).join('\n').replaceAll("https://x.com", "https://vxtwitter.com").replaceAll("https://twitter.com", "https://vxtwitter.com");
	}
}

function extractTwitterLinks(content) {
	const X_REGEX = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/\w+\/status\/\d+/g;
	return content.match(X_REGEX) || [];
}
