const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String
  }
})

module.exports.Guide = mongoose.model('Guide', GuideSchema);