import { EmbedBuilder, type Message } from 'discord.js';
import { createWorker } from 'tesseract.js';
import axios, { all } from 'axios';
import config from '../../config';
import sizeOf from 'image-size';
import VerifyModel from '../../models/verified.model';

const topLeftA = { x: 0.39821, y: 0.365672 };
const buttomRightA = { x: 0.615213, y: 0.402985 };

const topLeftU = { x: 0.403803, y: 0.256219 };
const buttomRightU = { x: 0.454139, y: 0.291045 };

export default async function (message: Message<true>) {
	if (
		message.author.bot ||
		!/^\!(\d){8,12}$/g.test(message.content) ||
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

			const pixelTopLeftA = {
				x: Math.round((dimension.width as number) * topLeftA.x),
				y: Math.round((dimension.height as number) * topLeftA.y),
			};
			const pixelWA = Math.round(
				(buttomRightA.x - topLeftA.x) * (dimension.width as number)
			);
			const pixelHA = Math.round(
				(buttomRightA.y - topLeftA.y) * (dimension.height as number)
			);

			const pixelTopLeftU = {
				x: Math.round((dimension.width as number) * topLeftU.x),
				y: Math.round((dimension.height as number) * topLeftU.y),
			};
			const pixelWU = Math.round(
				(buttomRightU.x - topLeftU.x) * (dimension.width as number)
			);
			const pixelHU = Math.round(
				(buttomRightU.y - topLeftU.y) * (dimension.height as number)
			);

			const MOcr = await worker.recognize(fileBuffer, {
				rectangle: {
					top: pixelTopLeftA.y,
					left: pixelTopLeftA.x,
					width: pixelWA,
					height: pixelHA,
				},
			});

			const POcr = await worker.recognize(fileBuffer);

			const text = MOcr.data.text || POcr.data.text;

			const UOcr = await worker.recognize(fileBuffer, {
				rectangle: {
					top: pixelTopLeftU.y,
					left: pixelTopLeftU.x,
					width: pixelWU,
					height: pixelHU,
				},
			});

			const username = UOcr.data.text.trim();
			const userId = message.content.replace('!', '');

			const userData = await VerifyModel.findOne({
				$or: [
					{
						user_name: username,
					},
					{
						user_id: userId,
					},
				],
			});

			if(userData) {
				return await msg.edit({
					content: '',
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`<@${message.author.id}> the profile is aleardy used by <@${userData.user_discord_id}>. Please contact ${config.ADMIN_ROLE_ID.map((role) => `<@&${role}>`).join(' ')} to fix it!`
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
				})
			}

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

					await VerifyModel.create({
						user_id: userId,
						user_name: username,
						user_discord_id: message.author.id,
						user_role_id: alliance.role_id,
						alliance_name: alliance.name,
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
