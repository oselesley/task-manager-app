const mongoose = require('mongoose')
const validator = require('validator')

const User = mongoose.model('User', {
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    validate (value) {
      if (value < 0) throw new Error('Invalid age')
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate (email) {
      if (!validator.isEmail(email)) throw new Error('Invalid email')
    }
  },
  password: {
    type: String,
    trim: true,
    validate (password) {
      if (password.length < 6 || password.includes('password'))
        throw new Error('password not valid!')
    }
  }
})

module.exports = User
