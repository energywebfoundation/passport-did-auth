const { verifyAddress } = require('./utils');
const superagent = require('superagent');

exports.cacheServerVerification = ({ cacheServerUrl = 'http://13.52.78.249:3333' } = {}) => (message, signedMessage, address, done) => {
  const addressVerified = verifyAddress(message, signedMessage, address);
  if (!addressVerified) {
    return done(null, false)
  }
  superagent.get(`${cacheServerUrl}/claim/requester/did:ethr:${address}?accepted=true`).end((err, res) => {
    if (err) {
      return done(err)
    }
    const { claim } = JSON.parse(res.text);
    if (claim.length < 1) {
      return done(null, false);
    }
    done(null, claim);
  })
}