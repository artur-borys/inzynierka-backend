const { Schema, model } = require("mongoose");

const EmergencySchema = new Schema({
  createDt: {
    type: Date,
    required: true,
    default: Date.now
  },
  finishDate: {
    type: Date
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paramedic: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  position: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 300
  }
})

module.exports.Emergency = model('Emergency', EmergencySchema)