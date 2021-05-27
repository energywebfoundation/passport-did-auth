"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.decodeJwToken = exports.verifyClaim = exports.lookup = exports.labelhash = exports.namehash = exports.isEncodedLabelhash = exports.decodeLabelhash = void 0;
var utils_1 = require("ethers/utils");
var base64url_1 = require("base64url");
var eth_ens_namehash_1 = require("eth-ens-namehash");
var jwt = require("jsonwebtoken");
var sha3 = require('js-sha3').keccak_256;
function decodeLabelhash(hash) {
    if (!(hash.startsWith('[') && hash.endsWith(']'))) {
        throw Error('Expected encoded labelhash to start and end with square brackets');
    }
    if (hash.length !== 66) {
        throw Error('Expected encoded labelhash to have a length of 66');
    }
    return "" + hash.slice(1, -1);
}
exports.decodeLabelhash = decodeLabelhash;
function isEncodedLabelhash(hash) {
    return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66;
}
exports.isEncodedLabelhash = isEncodedLabelhash;
function namehash(inputName) {
    var node = '';
    for (var i = 0; i < 32; i++) {
        node += '00';
    }
    if (inputName) {
        var labels = inputName.split('.');
        for (var i = labels.length - 1; i >= 0; i--) {
            var labelSha = void 0;
            if (isEncodedLabelhash(labels[i])) {
                labelSha = decodeLabelhash(labels[i]);
            }
            else {
                var normalizedLabel = eth_ens_namehash_1.normalize(labels[i]);
                labelSha = sha3(normalizedLabel);
            }
            node = sha3(Buffer.from(node + labelSha, 'hex'));
        }
    }
    return '0x' + node;
}
exports.namehash = namehash;
function labelhash(unnormalizedLabelOrLabelhash) {
    return isEncodedLabelhash(unnormalizedLabelOrLabelhash)
        ? '0x' + decodeLabelhash(unnormalizedLabelOrLabelhash)
        : '0x' + sha3(eth_ens_namehash_1.normalize(unnormalizedLabelOrLabelhash));
}
exports.labelhash = labelhash;
function lookup(obj, field) {
    if (!obj) {
        return null;
    }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
        var prop = obj[chain[i]];
        if (typeof prop === 'undefined') {
            return null;
        }
        if (typeof prop !== 'object') {
            return prop;
        }
        obj = prop;
    }
    return null;
}
exports.lookup = lookup;
var verifyClaim = function (token, _a) {
    var iss = _a.iss;
    var _b = __read(token.split('.'), 3), encodedHeader = _b[0], encodedPayload = _b[1], encodedSignature = _b[2];
    var msg = "0x" + Buffer.from(encodedHeader + "." + encodedPayload).toString('hex');
    var signature = base64url_1["default"].decode(encodedSignature);
    var hash = utils_1.arrayify(utils_1.keccak256(msg));
    var decodedAddress = iss.split(':')[2];
    var address = utils_1.recoverAddress(hash, signature);
    if (decodedAddress === address) {
        return iss;
    }
    var digest = utils_1.arrayify(utils_1.hashMessage(hash));
    var addressFromDigest = utils_1.recoverAddress(digest, signature);
    return decodedAddress === addressFromDigest ? iss : '';
};
exports.verifyClaim = verifyClaim;
var decodeJwToken = function (token) {
    return jwt.decode(token);
};
exports.decodeJwToken = decodeJwToken;
