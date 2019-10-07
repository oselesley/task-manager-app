const express = require('express')
const Task = require('../models/Task')

const router = express.Router()
// CREATE
// -----------------------------------------------------------------------------------------

router.post('/tasks', async (req, res) => {
  const task = new Task(req.body)

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

router.get('/tasks', async (req, res) => {
  // Task.find({}).then(tasks => {
  //   res.send(tasks)
  // }).catch(err => {
  //   res.status(500).send(err)
  // })

  try {
    const tasks = await Task.find({})
    res.send(tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/tasks/:id', async (req, res) => {
  // Task.findById(req.params.id).then(task => {
  // Even if there are no tasks with the given id, it is still a valid operation so mongoose doesn't return an error, so we use an if statement to work around this
  //   if (!task) return res.status(404).send()
  //   res.send(task)
  // }).catch(err => {
  //   res.status(500).send(err)
  // })

  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).send()

    res.send(task)
  } catch (err) {
    res.status(500).send(err)
  }
})

// UPDATE
// ---------------------------------------------------------------------------------------------------------------------------------------

router.put('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description']
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update))

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid Updates!' })

  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!task) return res.status(404).send({ error: 'Task not found!' })
    res.status(200).send(task)
  } catch (err) {
    res.status(400).send(err)
  }
})

// DELETE
// --------------------------------------------------------------------------------------------------------------------------------------------------

router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)
    if (!task) return res.status(404).send({ error: 'Task not found!' })
    res.status(200).send(task)
  } catch (err) {
    res.send(err)
  }
})

module.exports = router
