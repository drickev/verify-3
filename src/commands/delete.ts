import type { SlashCommandProps } from 'commandkit';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import VerifiedModel from '../models/verified.model';

export const data = new SlashCommandBuilder()
	.setName('delete')
	.setDescription('Delete verified user data!')
	.addStringOption((option) =>
		option.setName('id').setDescription('id to delete').setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('alliance')
			.setDescription('alliance to delete')
			.setRequired(false)
	);

export async function run({ interaction, client }: SlashCommandProps) {
	const id = interaction.options.getString('id');
	const alliance = interaction.options.getString('alliance');

	// Return confirmation to user to delete all data with the button to confirm or cancel and embeds message to show the confirmation message
	const ConfirmButton = new ButtonBuilder()
		.setCustomId('confirm')
		.setLabel('Confirm')
		.setStyle(ButtonStyle.Danger);

	const CancelButton = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('Cancel')
		.setStyle(ButtonStyle.Secondary);

	const ButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
		ConfirmButton,
		CancelButton
	);

	const msg = await interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle('Delete Data')
				.setDescription(`Are you sure you want to delete data?`)
				.setColor('Red')
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Requested by ${interaction.user.username}`,
				})
				.setTimestamp(),
		],
		components: [ButtonRow],
	});

	const collector = msg.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (i) => i.user.id === interaction.user.id,
		time: 15000,
	});

	collector.on('collect', async (i) => {
		if (i.customId === 'confirm') {
			if (!id && !alliance) {
				await VerifiedModel.deleteMany();
			} else if (id && !alliance) {
				await VerifiedModel.deleteMany({
					user_id: id,
				});
			} else if (!id && alliance) {
				await VerifiedModel.deleteMany({
					alliance_name: alliance,
				});
			} else {
				await VerifiedModel.deleteMany({
					$and: [
						{
							user_id: id,
						},
						{
							alliance_name: alliance,
						},
					],
				});
			}

			await i.update({
				components: [],
				embeds: [
					new EmbedBuilder()
						.setTitle('Delete Data')
						.setDescription('Deleted data!')
						.setColor('Red')
						.setFooter({
							iconURL: interaction.user.displayAvatarURL(),
							text: `Requested by ${interaction.user.username}`,
						})
						.setTimestamp(),
				],
			});
			collector.stop('deleted');
		} else {
			await i.update({
				components: [],
				embeds: [
					new EmbedBuilder()
						.setTitle('Delete Data')
						.setDescription('Cancelled!')
						.setColor('Grey')
						.setFooter({
							iconURL: interaction.user.displayAvatarURL(),
							text: `Requested by ${interaction.user.username}`,
						})
						.setTimestamp(),
				],
			});
			collector.stop('cancelled');
		}
	});

	collector.on('end', async (_, reason) => {
		if (reason === 'time') {
			await msg.edit({
				content: 'Time has run out!',
				components: [],
			});
		}
	});
}

export const options = {
	adminOnly: true,
};
