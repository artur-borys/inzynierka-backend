const { Schema, model } = require("mongoose");

const EventSchema = new Schema({
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
  location: {
    longtitude: {
      type: String,
      trim: true
    },
    latitude: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    maxlength: 300
  }
})

module.exports.Event = model('Event', EventSchema)