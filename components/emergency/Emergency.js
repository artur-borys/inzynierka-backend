const { Schema, model } = require("mongoose");

const EmergencySchema = new Schema({
  createDt: {
    type: Date,
    required: true,
    default: Date.now
  },
  finishDt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
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
  },
  guide: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Guide'
  }
})

module.exports.Emergency = model('Emergency', EmergencySchema)