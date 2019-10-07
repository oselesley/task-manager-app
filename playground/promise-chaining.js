require('../src/db/mongoose')
const Task = require('../src/models/Task')

// Task.findByIdAndDelete('5d99b7e718a08f0c201c927a')
//   .then(task => {
//     console.log(task)
//     return Task.countDocuments({ completed: false })
//   })
//   .then(count => {
//     console.log(count)
//   })
//   .catch(err => {
//     console.log(err)
//   })

const findTaskandDelete = async (id, completed) => {
  await Task.findByIdAndDelete(id)
  const count = await Task.countDocuments({ completed })

  return count
}

findTaskandDelete('5d99b7e718a08f0c201c927a', false).then(count => {
  console.log(count)
}).catch(err => {
  console.log(err)
})