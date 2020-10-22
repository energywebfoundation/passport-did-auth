const express = require('express')
const passport = require('passport');
const { IAMStrategy, cacheServerVerification } = require('../../lib/index')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const app = express();

passport.use(new IAMStrategy(cacheServerVerification()))
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(passport.initialize())

app.use(morgan())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/login', passport.authenticate('iam'), (req, res) => {
  res.json(req.user);
})

app.listen(3333, () => {
  console.log('App is ready and listening on port 3333');
})