const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const users = []       
const exercises = []   

function newId() {
  return crypto.randomBytes(12).toString('hex')
}


function parseDate(str) {
  if (!str) return new Date()
  const [y, m, d] = str.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return isNaN(date) ? new Date() : date
}


app.post('/api/users', (req, res) => {
  const user = { username: req.body.username, _id: newId() }
  users.push(user)
  res.json(user)
});


app.get('/api/users', (req, res) => {
  res.json(users)
});


app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: 'unknown user' })

  const exercise = {
    userId: user._id,
    description: req.body.description,
    duration: Number(req.body.duration),
    date: parseDate(req.body.date),
  }
  exercises.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id,
  })
});


app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: 'unknown user' })

  const { from, to, limit } = req.query
  let log = exercises.filter(e => e.userId === user._id)

  if (from) log = log.filter(e => e.date >= parseDate(from))
  if (to) log = log.filter(e => e.date <= parseDate(to))
  if (limit) log = log.slice(0, parseInt(limit))

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString(),
    })),
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})