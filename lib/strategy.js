/**
 * Module dependencies.
 */
const passport = require('passport-strategy');
const util = require('util');
const { lookup } = require('./utils');


/**
 * `Strategy` constructor.
 *
 * The IAM authentication strategy authenticates requests based on the
 * message and signMessage.
 *
 * Applications must supply a `verify` callback which accepts message, signedMessage and user `address` and then calls the `done` callback supplying a
 * `user`, which should be set to `false` if the credentials are not valid.
 * If an exception occurred, `err` should be set.
 *
 * Optionally, `options` can be used to change the fields in which the
 * credentials are found.
 *
 * Options:
 *   - `message`  field name where the username is found, defaults to message
 *   - `signedMessage`  field name where the password is found, defaults to signedMessage
 *   - `address` field name where the user address if found, defaults to address
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new IAMStrategy(
 *       function(message, signedMessage, address, done) {
 *         const user = / your code goes here /
 *         done(null, user)
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('IAM strategy requires a verify callback'); }
  
  this._message = options.messageField || 'message';
  this._signedMessage = options.signedMessageField || 'signedMessage';
  this._address = options.address || 'address'
  
  passport.Strategy.call(this);
  this.name = 'iam';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};
  const message = lookup(req.body, this._message) || lookup(req.query, this._message);
  const signedMessage = lookup(req.body, this._signedMessage) || lookup(req.query, this._signedMessage);
  const address = lookup(req.body, this._address) || lookup(req.query, this._address);

  
  if (!message || !signedMessage || !address) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }
  
  const self = this;
  
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  
  try {
    if (self._passReqToCallback) {
      this._verify(req, message, signedMessage, address, verified);
    } else {
      this._verify(message, signedMessage, address, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
