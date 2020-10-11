const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt")
const { Emergency } = require("../emergency/Emergency");

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
  fullName: {
    type: String,
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
    enum: ['regular', 'paramedic', 'dispatcher', 'admin'],
    default: 'regular'
  }
}, {
  toJSON: {
    virtuals: true, transform: (doc, ret, options) => {
      delete ret.id;
      delete ret.password;
      return ret;
    }
  }
})

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

UserSchema.methods.getActiveEmergency = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let filters;
      if (this.type === 'regular') {
        filters = {
          reportedBy: this.id,
          status: 'active'
        }
      } else if (this.type === 'paramedic') {
        filters = {
          paramedic: this.id,
          status: 'active'
        }
      } else {
        reject(new Error('UnauthorizedType'))
      }
      const emergency = await Emergency.findOne(filters).populate(['reportedBy', 'paramedic']).exec();
      resolve(emergency);
    } catch (err) {
      reject(err)
    }
  })
}

UserSchema.methods.getLatestEmergencies = function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (this.type === 'regular') {
        const emergencies = await Emergency.find({ reportedBy: this.id }).sort({ createDt: 'desc' }).exec();
        return resolve(emergencies);
      }
    } catch (err) {
      reject(err);
    }
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
  if (user.isModified('firstName') || user.isModified('lastName')) {
    user.fullName = `${user.firstName} ${user.lastName}`
  }
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

UserSchema.virtual('emergencies', {
  ref: 'Emergency',
  localField: '_id',
  foreignField: 'reportedBy',
  options: { sort: { createDt: 'desc' } }
})

module.exports.User = model('User', UserSchema)