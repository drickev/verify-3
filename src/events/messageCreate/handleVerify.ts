import { AttachmentBuilder, EmbedBuilder, type Message } from 'discord.js';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import axios from 'axios';
import config from '../../config';
import sizeOf from 'image-size';

const topLeftM = { x: 0.39821, y: 0.365672 };
const buttomRightM = { x: 0.615213, y: 0.402985 };
const topLeftP = { x: 0.15, y: 0.475556 };
const buttomRightP = { x: 0.2625, y: 0.5 };

export default async function (message: Message<true>) {
	if (message.author.bot) return;
	if (
		message.attachments.size > 0 &&
		message.channel.id === config.VERIFY_CHANNEL_ID
		// message.content === '#verify'
	) {
		const worker = await createWorker('eng');

		await Promise.all(
			message.attachments.map(async (attachment) => {
				const msg = await message.reply({
					content: 'Processing image...',
				});

				const fileArrayBuffer = await axios.get<ArrayBuffer>(
					attachment.url,
					{
						responseType: 'arraybuffer',
					}
				);

				const fileBuffer = Buffer.from(fileArrayBuffer.data);

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

				const pixelTopLeftP = {
					x: Math.round((dimension.width as number) * topLeftP.x),
					y: Math.round((dimension.height as number) * topLeftP.y),
				};

				const pixelWP = Math.round(
					(buttomRightP.x - topLeftP.x) * (dimension.width as number)
				);
				const pixelHP = Math.round(
					(buttomRightP.y - topLeftP.y) * (dimension.height as number)
				);

				// const image = await sharp(fileBuffer.data)
				// 	.extract({ left: 1108, top: 463, width: 378, height: 75 })
				// 	.toBuffer();

				let text = '';

				const MOcr = await worker.recognize(fileBuffer, {
					rectangle: {
						top: pixelTopLeftM.y,
						left: pixelTopLeftM.x,
						width: pixelWM,
						height: pixelHM,
					},
				});

				const POcr = await worker.recognize(fileBuffer);

				text = MOcr.data.text == '' ? POcr.data.text : MOcr.data.text;

				const user = message.guild.members.cache.get(message.author.id);
				const userRoles = user?.roles.cache.map((role) => role.id);

				// await message.channel.send({
				// 	content: text,
				// });

				for (const alliance of config.ALLIANCE_LIST) {
					if (userRoles?.includes(alliance.role_id)) {
						await msg.edit({
							content: '',
							embeds: [
								new EmbedBuilder()
									.setDescription(
										"You have aleardy been verified, please don't try to verify again!"
									)
									.setTitle('Alliance Verify')
									.setThumbnail(
										message.client.user.displayAvatarURL()
									)
									.setFooter({
										iconURL:
											message.author.displayAvatarURL(),
										text: `Requested by ${message.author.displayName}`,
									})
									.setColor('Red'),
							],
						});
						break;
					} else if (text.trim().includes(alliance.name)) {
						const user = message.guild.members.cache.get(
							message.author.id
						);

						await user?.roles.add(alliance.role_id);
						// send croped image to user with channel send

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
										iconURL:
											message.author.displayAvatarURL(),
										text: `Requested by ${message.author.displayName}`,
									}),
							],
						});
						break;
					}
				}
			})
		);

		await worker.terminate();
	}
}
