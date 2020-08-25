const { Schema, Types, model } = require("mongoose");

const MediaSchema = new Schema({
  emergencyId: {
    type: Types.ObjectId,
    required: true,
  },
  mime: {
    type: String,
    required: true,
  },
  binaryData: {
    type: Buffer,
    required: true,
  }
})

MediaSchema.statics.findByEmergency = function (id) {
  return this.find({ emergencyId: id });
}

module.exports = model('Media', MediaSchema);