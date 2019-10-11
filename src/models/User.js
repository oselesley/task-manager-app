const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/Task')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      validate(value) {
        if (value < 0) throw new Error('Invalid age')
      }
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(email) {
        if (!validator.isEmail(email)) throw new Error('Invalid email')
      }
    },
    password: {
      type: String,
      trim: true,
      validate(password) {
        if (password.length < 6 || password.includes('password'))
          throw new Error('password not valid!')
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  { timestamps: true }
)

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'author'
})

// We filter out password and tokens from the user object returned
userSchema.methods.toJSON = function () {
  const user = this

  const userObj = user.toObject()
  delete userObj.password
  delete userObj.tokens

  return userObj
}

userSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })

  user.save()

  return token
}

userSchema.statics.findUserByCredentials = async (email, password) => {
  const user = await User.findOne({ email })

  if (!user) throw new Error('Unable to login')

  const isValidPassword = await bcrypt.compare(password, user.password)

  if (!isValidPassword) throw new Error('Unable to Login')

  return user
}
userSchema.pre('save', async function(next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

userSchema.methods.deleteAllTasks = async function () {
  const user = this
  await Task.deleteMany({ author: user._id })
}
const User = mongoose.model('User', userSchema)

module.exports = User
