/**
 * Module dependencies.
 */
const Strategy = require('./strategy');
const { cacheServerVerification } = require('./cacheServerVerification')

exports.IAMStrategy = Strategy;
exports.cacheServerVerification = cacheServerVerification;
