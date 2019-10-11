const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeMail } = require('../mail/account')

const router = new express.Router()

// UPLOAD
// ----------------------------------------------------------------------------------------------------------------------------------------
const avatar = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter (req, file, callback) {
    if (!file.originalname.match(/\.(png|jpeg|jpg)/)) {
      return callback(new Error('Please upload an image!'))
    }
    callback(undefined, true)
  }
})

router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// DELETE UPLOAD
// -------------------------------------------------------------------------------------------------------------------------------------------

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  req.user.save()

  res.send()
})

// FETCH UPLOAD
// -------------------------------------------------------------------------------------------------------------------------------------------
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    // const user = req.user

    if (!user || !user.avatar) throw new Error('')

    res.set('Content-Type', 'image/jpeg')
    res.send(user.avatar)

  } catch (err) {
    res.status(400).send(err)
  }
})

// LOGIN
// ----------------------------------------------------------------------------------------------------------------------------------
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findUserByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (err) {
    res.status(400).send({ 'error': err.message })
  }
})

// LOGOUT
// -------------------------------------------------------------------------------------------------------------------------------------

router.post('/users/logout', auth, async (req, res) => {
  try {
    console.log('logged out', req.token)
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

    await req.user.save()
    res.send('Logged Out!')
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/users/logout/all', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()

    res.send('Logged Out of all devices!')
  } catch (err) {
    res.status(500).send(err)
  }
})

// CREATE
// -----------------------------------------------------------------------------------------------------------------------------------

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  // user
  //   .save()
  //   .then(user => {
  //     res.status(201).send(user)
  //   })
  //   .catch(err => {
  //     res.status(400).send(err)
  //   })

  try {
    const response = await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()

    res.status(201).send({ response, token })
  } catch (err) {
    res.status(400).send(err)
  }
})

// READ
// -----------------------------------------------------------------------------------------------

router.get('/users/me', auth, async (req, res) => {
  // User.find({})
  //   .then(data => {
  //     res.send(data)
  //   })
  //   .catch(err => {
  //     res.status(500).send(err)
  //   })

  try {
    // const users = await User.find({})
    res.send(req.user)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/users/:id', async (req, res) => {
  // User.findById(req.params.id).then(user => {
  //   // Even if there are no users with the given id, it is still a valid operation so mongoose doesn't return an error, so we use an if statement to work around this
  //   if (!user) return res.status(404).send()
  //   res.send(user)
  // }).catch(err => {
  //   res.status(500).send(err)
  // })

  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send()
    res.send(user)
  } catch (err) {
    res.status(500).send(err)
  }
})

// UPDATE
// -------------------------------------------------------------------------------------------------------------------------------------------------

router.put('/users', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'age', 'email', 'password']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid Updates!' })

  try {
    // const user = await User.findById(req.params.id)


    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // })
    // if (!user) return res.status(404).send({ error: 'User not Found!' })

    updates.forEach(update => (req.user[update] = req.body[update]))

    await req.user.save()
    res.status(200).send(req.user)
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
// --------------------------------------------------------------------------------------------------------------------------------------------------

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.params.id)
    // if (!user) return res.status(404).send({ error: 'User not found!' })
    console.log('deleting user')
    const user = await User.findOneAndDelete({ _id: req.user._id })
    sendGoodbyeMail(req.user.email, req.user.name)
    await user.deleteAllTasks()
    res.status(200).send(user)
  } catch (err) {
    res.status(500).send(err)
  }
})

// 404
// ---------------------------------------------------------------------------------------------------------------------------------------------

// router.get('*', (req, res) => {
//   res.status(404).send({ error: 'Page Not Found!' })
// })

module.exports = router
