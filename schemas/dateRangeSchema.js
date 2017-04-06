const mongoose = require('mongoose');

const dateRangeSchema = mongoose.Schema({
  start: String,
  end: String
})

module.exports = dateRangeSchema;
