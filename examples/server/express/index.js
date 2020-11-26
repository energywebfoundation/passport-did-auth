const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const { preparePassport } = require('./passport')

const { passport, LOGIN_STRATEGY } = preparePassport()

const app = express();

app.use(passport.initialize(), cors())

app.use(morgan())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/login', passport.authenticate(LOGIN_STRATEGY), (req, res) => {
  res.json({ token: req.user });
})
app.get('/roles', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user.verifiedRoles)
})

app.get('/user', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user)
})

app.listen(3333, () => {
  console.log('App is ready and listening on port 3333');
})