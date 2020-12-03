# Authentication in Express application

1. Create login strategy and include it in application middleware along with
jwt strategies:
```javascript

const jwtSecret = 'secret'

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
}

passport.use(new LoginStrategy({ jwtSecret, name: LOGIN_STRATEGY, rpcUrl: 'https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org/', cacheServerUrl: 'http://13.52.78.249:3333/' }))
  passport.use(new Strategy(jwtOptions, function (payload, done) {
    return done(null, payload)
  }))
```
2. Apply login middleware on login route and jwt middleware on protected routes
```javascript
app.post('/login', passport.authenticate(LOGIN_STRATEGY), (req, res) => {
  res.json({ token: req.user });
})
app.get('/roles', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user.verifiedRoles)
})
```