const { Schema, Types, model } = require("mongoose");

const ImageSchema = new Schema({
  emergencyId: {
    type: Types.ObjectId,
    required: true,
  },
  data: {
    type: String,
    required: true,
  }
})

ImageSchema.statics.findByEmergency = function (id) {
  return this.find({ emergencyId: id });
}

module.exports = model('Image', ImageSchema);