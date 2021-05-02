const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	username: String,
	nickname: String,
	verified: Boolean
});

module.exports = mongoose.model('userSchema', schema);
