import type { ValidationProps } from 'commandkit';
import config from '../config';

export default async function ({ interaction, commandObj }: ValidationProps) {
	if (!interaction.isCommand()) return;

	if (commandObj.options?.adminOnly) {
		const member = interaction.guild?.members.cache.get(
			interaction.user.id
		);

		if (
			member?.roles.cache.find((role) =>
				config.ADMIN_ROLE_ID.includes(role.id)
			) === undefined
		) {
			interaction.reply({
				content: 'You need to be a admin to use this command!',
				ephemeral: true,
			});

			return true;
		}
	}
}
