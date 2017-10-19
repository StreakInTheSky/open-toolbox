const mongoose = require('mongoose');

const dateRangeSchema = mongoose.Schema({
  start: {type: Date},
  end: {type: Date}
})

module.exports = dateRangeSchema;
