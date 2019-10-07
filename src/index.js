const express = require('express')
const User = require('./models/User')
const Task = require('./models/Task')
const mongoose = require('mongoose')
const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRouter')
require('./db/mongoose')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(PORT, () => {
  console.log('listening at port ' + PORT)
})
