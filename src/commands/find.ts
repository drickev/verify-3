import type { SlashCommandProps } from 'commandkit';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import VerifiedModel from '../models/verified.model';

export const data = new SlashCommandBuilder()
	.setName('find')
	.setDescription('Find verified user!')
	.addStringOption((option) =>
		option.setName('id').setDescription('id to find').setRequired(true)
	);

export async function run({ interaction, client }: SlashCommandProps) {
	const id = interaction.options.getString('id');

	const user = await VerifiedModel.findOne({
		$or: [
			{
				user_discord_id: id?.replace(/<@|>/g, ''),
			},
            {
                user_id: id
            }
		],
	});

	if (!user) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('User Not Found!')
					.setDescription(`User with id ${id} not found!`)
					.setColor('Red')
					.setFooter({
						iconURL: interaction.user.displayAvatarURL(),
						text: `Requested by ${interaction.user.username}`,
					})
					.setTimestamp(),
			],
		});
	}

	await interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`User Found: ${id}`!)
				.setThumbnail(client.user.displayAvatarURL())
				.setDescription(
					`IGN: ${user.user_name}
UID: ${user.user_id}
Discord ID: ${user.user_discord_id}
Role ID: ${user.user_role_id}
Alliance: ${user.alliance_name}`
				)
				.setColor('Green')
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Requested by ${interaction.user.username}`,
				})
				.setTimestamp(),
		],
	});
}

export const options = {
    adminOnly: true
};
