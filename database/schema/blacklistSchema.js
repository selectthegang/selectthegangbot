const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
});

module.exports = mongoose.model('blacklistSchema', schema);
