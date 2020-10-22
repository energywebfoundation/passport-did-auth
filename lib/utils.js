const ethers = require('ethers')

const { hashMessage, arrayify, recoverAddress } = ethers.utils

exports.lookup = function (obj, field) {
  if (!obj) { return null; }
  const chain = field.split(']').join('').split('[');
  for (let i = 0, len = chain.length; i < len; i++) {
    const prop = obj[chain[i]];
    if (typeof (prop) === 'undefined') { return null; }
    if (typeof (prop) !== 'object') { return prop; }
    obj = prop;
  }
  return null;
};

exports.verifyAddress = function (message, signedMessage, address) {
  const hash = arrayify(hashMessage(message))
  const addr = recoverAddress(hash, signedMessage)
  return addr === address
}
