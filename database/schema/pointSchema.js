const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username: String,
  points: Number,
});

module.exports = mongoose.model('pointSchema', schema);
