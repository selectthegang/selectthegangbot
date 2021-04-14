const mongoose = require('mongoose');
const blacklistSchema = require('./schema/blacklistSchema');
const userSchema = require('./schema/userSchema');
const messageSchema = require('./schema/messages');
const todoSchema = require('./schema/todo');

module.exports = {
	blacklistSchema: require('./schema/blacklistSchema'),
	userSchema: require('./schema/userSchema'),
	messageSchema: require('./schema/messages'),
	todoSchema: require('./schema/todo'),

	async connect(uri) {
		await mongoose.connect(
			uri,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			}
		);
	},
	todo: {
		async list() {
			const data = await todoSchema.find();
			return data;
		},
		async add(message) {
			const add = await todoSchema.findOneAndUpdate(
				{
					message: message
				},
				{
					message: message
				},
				{
					upsert: true
				}
			);
		},
		async remove(message) {
			const res = await todoSchema.deleteOne({ message: message });
			return res;
		}
	},
	messages: {
		async list() {
			const data = await messageSchema.find();
			return data;
		},
		async add(username, message, color, time, profilepicture) {
			const add = await messageSchema.findOneAndUpdate(
				{
					username: username,
					message: message,
					color: color,
					time: time,
					picture: profilepicture
				},
				{
					username: username,
					message: message
				},
				{
					upsert: true
				}
			);
		},
		async remove(username) {
			const res = await messageSchema.deleteOne({ username: username });
			return res;
		}
	},
	user: {
		async get(username) {
			const res = await userSchema.findOne({ username: username });
			return res;
		},
		async delete(username) {
			const res = await userSchema.deleteOne({ username: username });
			return res;
		},
		async add(username, nickname, role) {
			const add = await userSchema.findOneAndUpdate(
				{
					username: username,
					nickname: nickname,
					role: role
				},
				{
					username: username,
					nickname: nickname,
					role: role
				},
				{
					upsert: true
				}
			);
		}
	},
	blacklist: {
		async get(username) {
			const res = await blacklistSchema.findOne({ username: username });
			return res;
		},
		async add(username, number) {
			const add = await blacklistSchema.findOneAndUpdate(
				{
					username: username
				},
				{
					username: username
				},
				{
					upsert: true
				}
			);
		},
		async remove(username, number) {
			const res = await pointSchema.deleteOne({ username: username });
			return res;
		}
	}
};
