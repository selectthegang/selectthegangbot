const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  itemname: String,
  price: Number,
  response: String,
});

module.exports = mongoose.model('itemSchema', schema);
