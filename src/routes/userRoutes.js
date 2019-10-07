const express = require('express')
const User = require('../models/User')

const router = express.Router()

// CREATE
// -----------------------------------------------------------------------------------------

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
    res.status(201).send(response)
  } catch (err) {
    res.status(400).send(err)
  }
})

// READ
// -----------------------------------------------------------------------------------------------

router.get('/users', async (req, res) => {
  // User.find({})
  //   .then(data => {
  //     res.send(data)
  //   })
  //   .catch(err => {
  //     res.status(500).send(err)
  //   })

  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
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

router.put('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'age', 'email']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid Updates!' })

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!user) return res.status(404).send({ error: 'User not Found!' })
    res.status(200).send(user)
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
// --------------------------------------------------------------------------------------------------------------------------------------------------

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).send({ error: 'User not found!' })
    res.status(200).send(user)
  } catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router
