import { Schema } from 'mongoose';

export default new Schema({
	user_id: { type: String, required: true },
	user_discord_id: { type: String, required: true },
	user_role_id: { type: String, required: true },
	user_name: { type: String, required: true },
	alliance_name: { type: String, required: true },
});
