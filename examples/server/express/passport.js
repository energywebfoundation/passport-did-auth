const passport = require('passport');
const { LoginStrategy } = require('../../../dist')

const LOGIN_STRATEGY = 'login'

const { ExtractJwt, Strategy } = require('passport-jwt')

const jwtSecret = 'secret'

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
}
module.exports.preparePassport = () => {
  passport.use(new LoginStrategy({ jwtSecret, name: LOGIN_STRATEGY, rpcUrl: 'https://volta-rpc.energyweb.org/', cacheServerUrl: 'https://volta-iam-cacheserver.energyweb.org/' }))
  passport.use(new Strategy(jwtOptions, function (payload, done) {
    return done(null, payload)
  }))
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
  return { passport, LOGIN_STRATEGY }
}

