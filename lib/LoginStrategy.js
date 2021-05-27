"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
exports.LoginStrategy = void 0;
var utils_1 = require("./utils");
var did_ethr_resolver_1 = require("@ew-did-registry/did-ethr-resolver");
var ethers_1 = require("ethers");
var jwt = require("jsonwebtoken");
var ClaimVerifier_1 = require("./ClaimVerifier");
var did_1 = require("@ew-did-registry/did");
var cacheServerClient_1 = require("./cacheServerClient");
var did_ipfs_store_1 = require("@ew-did-registry/did-ipfs-store");
var BaseStrategy_1 = require("./BaseStrategy");
var PublicResolverFactory_1 = require("../ethers/PublicResolverFactory");
var abi1056 = did_ethr_resolver_1.ethrReg.abi;
var LoginStrategy = /** @class */ (function (_super) {
    __extends(LoginStrategy, _super);
    function LoginStrategy(_a, _nestJsCB // Added just for nestjs compatibility
    ) {
        var _b = _a.claimField, claimField = _b === void 0 ? 'identityToken' : _b, rpcUrl = _a.rpcUrl, cacheServerUrl = _a.cacheServerUrl, privateKey = _a.privateKey, _c = _a.numberOfBlocksBack, numberOfBlocksBack = _c === void 0 ? 4 : _c, jwtSecret = _a.jwtSecret, jwtSignOptions = _a.jwtSignOptions, _d = _a.ensResolverAddress, ensResolverAddress = _d === void 0 ? '0x0a97e07c4Df22e2e31872F20C5BE191D5EFc4680' : _d, _e = _a.didContractAddress, didContractAddress = _e === void 0 ? did_ethr_resolver_1.VoltaAddress1056 : _e, _f = _a.ipfsUrl, ipfsUrl = _f === void 0 ? 'https://ipfs.infura.io:5001/api/v0/' : _f, acceptedRoles = _a.acceptedRoles, options = __rest(_a, ["claimField", "rpcUrl", "cacheServerUrl", "privateKey", "numberOfBlocksBack", "jwtSecret", "jwtSignOptions", "ensResolverAddress", "didContractAddress", "ipfsUrl", "acceptedRoles"]);
        var _this = _super.call(this, options) || this;
        _this.isAuthorized = function (claimedToken, didDocument) {
            //retrieve claim infos from token
            var claimInfos = utils_1.decodeJwToken(claimedToken);
            //extract all authenticated users and filter to keep those owning the claimed DID
            var authenticated = didDocument.authentication.filter(function (auth) {
                auth["publicKey"] === (claimInfos.did + "#owner").toString();
            });
            return authenticated.length === 0;
        };
        _this.claimField = claimField;
        _this.provider = new ethers_1.providers.JsonRpcProvider(rpcUrl);
        _this.ensResolver = PublicResolverFactory_1.PublicResolverFactory.connect(ensResolverAddress, _this.provider);
        if (cacheServerUrl && !privateKey) {
            throw new Error('You need to provide privateKey of an accepted account to login to cache server');
        }
        if (cacheServerUrl && privateKey) {
            _this.cacheServerClient = new cacheServerClient_1.CacheServerClient({
                privateKey: privateKey,
                provider: _this.provider,
                url: cacheServerUrl
            });
            _this.strategyAddress = _this.cacheServerClient.address;
            _this.cacheServerClient.login();
        }
        var registrySetting = {
            abi: abi1056,
            address: didContractAddress,
            method: did_1.Methods.Erc1056
        };
        _this.didResolver = new did_ethr_resolver_1.Resolver(_this.provider, registrySetting);
        _this.ipfsStore = new did_ipfs_store_1.DidStore(ipfsUrl);
        _this.numberOfBlocksBack = numberOfBlocksBack;
        _this.jwtSecret = jwtSecret;
        _this.acceptedRoles = acceptedRoles && new Set(acceptedRoles);
        _this.jwtSignOptions = jwtSignOptions;
        return _this;
    }
    /**
     * @description verifies issuer signature, then check that claim issued
     * no latter then `this.numberOfBlocksBack` and user has enrolled with at
     * least one role
     * @param token
     * @param payload
     * @callback done on successful validation is called with encoded {did, verifiedRoles} object
     */
    LoginStrategy.prototype.validate = function (token, payload, done) {
        return __awaiter(this, void 0, void 0, function () {
            var did, _a, address, latestBlock, err_1, roleClaims, _b, verifier, uniqueRoles, user, jwtToken, err_2;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.verifyDidClaim(token, payload)];
                    case 1:
                        did = _c.sent();
                        if (!did) {
                            console.log('Not Verified');
                            return [2 /*return*/, done(null, null, 'Not Verified')];
                        }
                        _a = __read(did.split(':'), 3), address = _a[2];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.provider.getBlockNumber()];
                    case 3:
                        latestBlock = _c.sent();
                        if (!payload.claimData.blockNumber ||
                            latestBlock - this.numberOfBlocksBack >= payload.claimData.blockNumber) {
                            console.log('Claim outdated');
                            return [2 /*return*/, done(null, null, 'Claim outdated')];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _c.sent();
                        console.log('Provider err', err_1);
                        return [2 /*return*/, done(err_1)];
                    case 5:
                        _c.trys.push([5, 10, , 11]);
                        if (!
                        /*
                         * getUserClaims attempts to retrieve claims from cache-server
                         * and so when the cache-server itself is using the LoginStrategy,
                         * this creates a login attempt loop.
                         * Therefore, not getting userClaims
                         * if address attempting to login is the address of the strategy
                         */
                        (this.strategyAddress === address)) 
                        /*
                         * getUserClaims attempts to retrieve claims from cache-server
                         * and so when the cache-server itself is using the LoginStrategy,
                         * this creates a login attempt loop.
                         * Therefore, not getting userClaims
                         * if address attempting to login is the address of the strategy
                         */
                        return [3 /*break*/, 6];
                        _b = [];
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.getUserClaims(did)];
                    case 7:
                        _b = _c.sent();
                        _c.label = 8;
                    case 8:
                        roleClaims = _b;
                        verifier = new ClaimVerifier_1.ClaimVerifier(roleClaims, this.getRoleDefinition.bind(this), this.getUserClaims.bind(this));
                        return [4 /*yield*/, verifier.getVerifiedRoles()];
                    case 9:
                        uniqueRoles = _c.sent();
                        if (this.acceptedRoles &&
                            this.acceptedRoles.size > 0 &&
                            uniqueRoles.length > 0 &&
                            !uniqueRoles.some(function (_a) {
                                var namespace = _a.namespace;
                                return _this.acceptedRoles.has(namespace);
                            })) {
                            return [2 /*return*/, done(null, null, 'User does not have an accepted role.')];
                        }
                        user = {
                            did: payload.iss,
                            verifiedRoles: uniqueRoles
                        };
                        if (this.jwtSecret) {
                            jwtToken = this.encodeToken(user);
                            return [2 /*return*/, done(null, jwtToken)];
                        }
                        return [2 /*return*/, done(null, user)];
                    case 10:
                        err_2 = _c.sent();
                        console.log(err_2);
                        return [2 /*return*/, done(err_2)];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    LoginStrategy.prototype.decodeToken = function (token, options) {
        return jwt.decode(token, options);
    };
    /**
     *
     * @param data payload to encode
     * @param options
     */
    LoginStrategy.prototype.encodeToken = function (data) {
        return jwt.sign(data, this.jwtSecret, this.jwtSignOptions);
    };
    /**
     * @description extracts encoded payload either from request body or query
     *
     * @param req
     *
     * @returns {string} encoded claim
     */
    LoginStrategy.prototype.extractToken = function (req) {
        return (utils_1.lookup(req.body, this.claimField) || utils_1.lookup(req.query, this.claimField));
    };
    LoginStrategy.prototype.getRoleDefinition = function (namespace) {
        return __awaiter(this, void 0, void 0, function () {
            var namespaceHash, definition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.cacheServerClient) {
                            return [2 /*return*/, this.cacheServerClient.getRoleDefinition({ namespace: namespace })];
                        }
                        namespaceHash = utils_1.namehash(namespace);
                        return [4 /*yield*/, this.ensResolver.text(namespaceHash, 'metadata')];
                    case 1:
                        definition = _a.sent();
                        if (definition) {
                            return [2 /*return*/, JSON.parse(definition)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LoginStrategy.prototype.getUserClaims = function (did) {
        return __awaiter(this, void 0, void 0, function () {
            var didDocument, services, claims;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.cacheServerClient) {
                            return [2 /*return*/, this.cacheServerClient.getUserClaims({ did: did })];
                        }
                        return [4 /*yield*/, this.didResolver.read(did)];
                    case 1:
                        didDocument = _a.sent();
                        services = didDocument.service || [];
                        return [4 /*yield*/, Promise.all(services.map(function (_a) {
                                var serviceEndpoint = _a.serviceEndpoint;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var claimToken, _b, claimData, iss;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0: return [4 /*yield*/, this.ipfsStore.get(serviceEndpoint)];
                                            case 1:
                                                claimToken = _c.sent();
                                                _b = this.decodeToken(claimToken), claimData = _b.claimData, iss = _b.iss;
                                                return [2 /*return*/, {
                                                        iss: iss,
                                                        claimType: claimData === null || claimData === void 0 ? void 0 : claimData.claimType,
                                                        claimTypeVersion: claimData === null || claimData === void 0 ? void 0 : claimData.claimTypeVersion
                                                    }];
                                        }
                                    });
                                });
                            }))];
                    case 2:
                        claims = _a.sent();
                        return [2 /*return*/, claims.reduce(function (acc, item) {
                                if (item.claimType) {
                                    acc.push(item);
                                }
                                return acc;
                            }, [])];
                }
            });
        });
    };
    /**
     * @description checks if the claimer is authenticated into the DID Document
     *
     * @param token
     * @param payload
     *
     * @returns {string} issuer DID or empty string
     */
    LoginStrategy.prototype.verifyDidClaim = function (token, _a) {
        var iss = _a.iss;
        return __awaiter(this, void 0, void 0, function () {
            var didDocument;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.didResolver.read(iss)];
                    case 1:
                        didDocument = _b.sent();
                        if (this.isAuthorized(token, didDocument))
                            return [2 /*return*/, iss];
                        return [2 /*return*/, null];
                }
            });
        });
    };
    return LoginStrategy;
}(BaseStrategy_1.BaseStrategy));
exports.LoginStrategy = LoginStrategy;
