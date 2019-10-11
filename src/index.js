const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRouter')



require('./db/mongoose')

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT, () => {
  console.log('listening at port ' + PORT)
})
