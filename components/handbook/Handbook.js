const { Schema, Types } = require("mongoose");
const mongoose = require('mongoose');

const HandbookSchema = new Schema({
  version: {
    type: Number,
    required: true,
    default: 1
  },
  guides: [
    {
      type: Types.ObjectId,
      ref: 'Guide'
    }
  ]
})

module.exports.Handbook = mongoose.model('Handbook', HandbookSchema);