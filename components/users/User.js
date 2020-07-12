const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt")

const UserSchema = new Schema({
  nick: {
    type: String,
    min: 3,
    max: 32,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telephoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createDt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updateDt: {
    type: Date
  },
  hidden: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: "/empty_avatar.jpg"
  },
  type: {
    type: String,
    enum: ['regular', 'paramedic', 'dispatcher'],
    default: 'regular'
  }
})

UserSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.password;
  delete obj._id;
  delete obj.hidden;
  return obj;
}

UserSchema.methods.checkPassword = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, same) => {
      if (err) {
        reject(err)
      }
      if (same) {
        resolve()
      } else {
        reject(new Error("Hasła nie są zgodne"))
      }
    })
  })
}

UserSchema.statics.findByNick = function (nick) {
  return nick ? this.findOne({ nick: new RegExp(nick, 'i') }) : null
}

UserSchema.statics.findByEmail = function (email) {
  return email ? this.findOne({ email: new RegExp(email, 'i') }) : null
}

UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) {
          return next(err)
        }

        user.password = hash;
        next();
      })
    });
  } else {
    return next();
  }
})

module.exports.User = model('User', UserSchema)