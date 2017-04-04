const mongoose = require('mongoose');

const dateRangeSchema = mongoose.Schema({
  start: Date,
  end: Date
})

module.exports = dateRangeSchema;
