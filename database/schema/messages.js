const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	username: String,
	message: String,
	color: String,
	time: String,
	picture: String,
	id: String,
	verified: Boolean,
});

module.exports = mongoose.model('messages', schema);
