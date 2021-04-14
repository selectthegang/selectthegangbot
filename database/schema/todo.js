const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  message: String,
});

module.exports = mongoose.model('todo', schema);