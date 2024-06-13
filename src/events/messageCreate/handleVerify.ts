import { EmbedBuilder, type Message } from 'discord.js';
import { createWorker } from 'tesseract.js';
import axios from 'axios';
import config from '../../config';
import sizeOf from 'image-size';

const topLeftM = { x: 0.39821, y: 0.365672 };
const buttomRightM = { x: 0.615213, y: 0.402985 };

export default async function (message: Message<true>) {
	if (
		message.author.bot ||
		message.content !== '#verify' ||
		message.attachments.size === 0 ||
		message.channel.id !== config.VERIFY_CHANNEL_ID
	)
		return;

	const worker = await createWorker('eng');

	await Promise.all(
		message.attachments.map(async (attachment) => {
			const msg = await message.reply('Processing image...');

			const { data: fileArrayBuffer } = await axios.get<ArrayBuffer>(
				attachment.url,
				{ responseType: 'arraybuffer' }
			);

			const fileBuffer = Buffer.from(fileArrayBuffer);

			const dimension = sizeOf(fileBuffer);

			const pixelTopLeftM = {
				x: Math.round((dimension.width as number) * topLeftM.x),
				y: Math.round((dimension.height as number) * topLeftM.y),
			};

			const pixelWM = Math.round(
				(buttomRightM.x - topLeftM.x) * (dimension.width as number)
			);
			const pixelHM = Math.round(
				(buttomRightM.y - topLeftM.y) * (dimension.height as number)
			);

			const MOcr = await worker.recognize(fileBuffer, {
				rectangle: {
					top: pixelTopLeftM.y,
					left: pixelTopLeftM.x,
					width: pixelWM,
					height: pixelHM,
				},
			});

			const POcr = await worker.recognize(fileBuffer);

			const text = MOcr.data.text || POcr.data.text;

			const user = message.guild.members.cache.get(message.author.id);
			const userRoles = user?.roles.cache.map((role) => role.id);

			for (const alliance of config.ALLIANCE_LIST) {
				if (userRoles?.includes(alliance.role_id)) {
					await msg.edit({
						content: '',
						embeds: [
							new EmbedBuilder()
								.setDescription(
									"You have already been verified, please don't try to verify again!"
								)
								.setTitle('Alliance Verify')
								.setThumbnail(
									message.client.user.displayAvatarURL()
								)
								.setFooter({
									iconURL: message.author.displayAvatarURL(),
									text: `Requested by ${message.author.displayName}`,
								})
								.setColor('Red'),
						],
					});
					break;
				} else if (text.trim().includes(alliance.name)) {
					await user?.roles.add(alliance.role_id);

					await msg.edit({
						content: '',
						embeds: [
							new EmbedBuilder()
								.setDescription('You have been verified!')
								.setTitle('Alliance Verify')
								.setThumbnail(
									message.client.user.displayAvatarURL()
								)
								.setFooter({
									iconURL: message.author.displayAvatarURL(),
									text: `Requested by ${message.author.displayName}`,
								})
								.setColor('Green'),
						],
					});
					break;
				}
			}

			if (msg.content === 'Processing image...') {
				await msg.edit({
					content: '',
					embeds: [
						new EmbedBuilder()
							.setDescription(
								'Your alliance name is not found! Please try again!'
							)
							.setTitle('Alliance Verify')
							.setThumbnail(
								message.client.user.displayAvatarURL()
							)
							.setFooter({
								iconURL: message.author.displayAvatarURL(),
								text: `Requested by ${message.author.displayName}`,
							})
							.setColor('Red'),
					],
				});
			}
		})
	);

	await worker.terminate();
}
