const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]

    const tokenObj = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: tokenObj._id, 'tokens.token': token })
    if (!user) throw new Error('user not found')

    req.user = user
    req.token = token
    next()

  } catch (err) {
    res.status(401).send('User not Authenticated!')
  }
}

module.exports = auth