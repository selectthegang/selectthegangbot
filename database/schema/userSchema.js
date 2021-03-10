const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  nickname: String,
  role: String,
});

module.exports = mongoose.model('userSchema', schema);
