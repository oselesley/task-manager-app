const express = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')
const mongodb = require('mongodb')
const { ObjectID } = mongodb

const router = new express.Router()

// CREATE
// -----------------------------------------------------------------------------------------

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({ ...req.body, author: req.user._id })

  // task
  //   .save()
  //   .then(task => {
  //     res.status(201).send(task)
  //   })
  //   .catch(err => {
  //     res.status(400).send(err)
  //   })

  try {
    const response = await task.save()
    res.status(201).send(task)
  } catch (err) {
    res.status(400).send(err)
  }
})

// READ
// -----------------------------------------------------------------------------------------------------------------

router.get('/tasks', auth, async (req, res) => {
  // Task.find({}).then(tasks => {
  //   res.send(tasks)
  // }).catch(err => {
  //   res.status(500).send(err)
  // })
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const [sortParam='updatedAt', order=1] = req.query.sortBy.split(':')
    sort[sortParam] = order === 'desc' ? -1 : 1
  }
  console.log(req.query)
  let completed = req.query.completed === 'true'
  try {
    // const tasks = await Task.find({ author: req.user._id, completed })
    const tasks = await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  // Task.findById(req.params.id).then(task => {
  // Even if there are no tasks with the given id, it is still a valid operation so mongoose doesn't return an error, so we use an if statement to work around this
  //   if (!task) return res.status(404).send()
  //   res.send(task)
  // }).catch(err => {
  //   res.status(500).send(err)
  // })


  try {
    const task = await Task.findOne({ _id: req.params.id, author: req.user._id })
    if (!task) return res.status(404).send()

    res.send(task)
  } catch (err) {
    res.status(500).send(err)
  }
})

// UPDATE
// ---------------------------------------------------------------------------------------------------------------------------------------

router.put('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid Updates!' })

  try {
    const task = await Task.findOne({ _id: req.params.id, author: req.user._id })
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // })
    if (!task) return res.status(404).send({ error: 'Task not found!' })

    updates.forEach(update => {
      task[update] = req.body[update]
    })

    await task.save()
    res.status(200).send(task)
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
// --------------------------------------------------------------------------------------------------------------------------------------------------

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, author: req.user._id })
    if (!task) return res.status(404).send({ error: 'Task not found!' })
    res.status(200).send(task)
  } catch (err) {
    res.send(err)
  }
})

module.exports = router
