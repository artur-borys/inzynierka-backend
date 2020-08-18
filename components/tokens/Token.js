const { Schema, model } = require("mongoose");

const TokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false,
    required: true
  }
})

TokenSchema.methods.revoke = async function () {
  this.revoked = true
  return this.save();
}