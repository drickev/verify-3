import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';
import config from './config';
import path from 'path';
import mongoose from 'mongoose';

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.DirectMessages,
	],
});

new CommandKit({
	client,
	eventsPath: path.join(__dirname, 'events'),
	commandsPath: path.join(__dirname, 'commands'),
	validationsPath: path.join(__dirname, 'validations'),
});

client.login(config.BOT_TOKEN).then(() => {
	console.log('Bot is online');
	mongoose.connect(config.DATABASE_URI).then(() => {
		console.log('Connected to database');
	});
});
