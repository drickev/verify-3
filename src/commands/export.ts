import type { SlashCommandProps } from 'commandkit';
import { SlashCommandBuilder } from 'discord.js';
import VerifiedModel from '../models/verified.model';
import xlsx from 'xlsx';

export const data = new SlashCommandBuilder()
	.setName('export')
	.setDescription('Export Data to XLSX!');

export async function run({ interaction, client }: SlashCommandProps) {
	const user = await VerifiedModel.find().select({ _id: 0, __v: 0 });

	const wb = xlsx.utils.book_new();
	const ws = xlsx.utils.json_to_sheet(user.map((u) => u.toJSON()));
	xlsx.utils.book_append_sheet(wb, ws, 'Verified Users');
	const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

	await interaction.reply({
		content: 'Here is the data!',
		files: [
			{
				attachment: buffer,
				name: `verified-users-${Date.now()}.xlsx`,
			},
		],
	});
}

export const options = {
	adminOnly: true,
};
