## [2.0.0-alpha.23](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.22...v2.0.0-alpha.23) (2022-10-21)


### Bug Fixes

* export types ([4b69c1b](https://github.com/energywebfoundation/passport-did-auth/commit/4b69c1b21c3b468a1c21a579a7c78d0dc85c617b))

## [2.0.0-alpha.22](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.21...v2.0.0-alpha.22) (2022-10-20)


### Features

* code refactoring ([2d25f40](https://github.com/energywebfoundation/passport-did-auth/commit/2d25f405176b2022663bbcd4b9a2507d05a4ee8b))
* return reason for failed authorisation ([0249a25](https://github.com/energywebfoundation/passport-did-auth/commit/0249a256ed4f351d9262bc4cfa2639b28b788655))
* return valid and invalid roles after authentication ([c9aabb8](https://github.com/energywebfoundation/passport-did-auth/commit/c9aabb8e1a9d154d3d946ee4f2380dc8a1bd55bb))
* update tests ([b5a0436](https://github.com/energywebfoundation/passport-did-auth/commit/b5a04369dc022c415e36106ae94de08e93318cad))

## [2.0.0-alpha.21](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.20...v2.0.0-alpha.21) (2022-10-11)


### Features

* add diddocument resolution and caching to credential resolver ([19f5708](https://github.com/energywebfoundation/passport-did-auth/commit/19f570849953d09307c67caefc8f79bc32bb9aea))

## [2.0.0-alpha.20](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.19...v2.0.0-alpha.20) (2022-10-07)


### ⚠ BREAKING CHANGES

* ipfs url replaced by ipfs params object

### Bug Fixes

* set ipfs headers ([d09a054](https://github.com/energywebfoundation/passport-did-auth/commit/d09a054e85bbc6821aed4e0d378f030e29801fac))

## [2.0.0-alpha.19](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.18...v2.0.0-alpha.19) (2022-10-06)


### Features

* add cache to resolvers ([1a291c2](https://github.com/energywebfoundation/passport-did-auth/commit/1a291c2db1c197d2230a4f1a662623a34fdac067))

## [2.0.0-alpha.18](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.17...v2.0.0-alpha.18) (2022-10-03)


### ⚠ BREAKING CHANGES

* initialise loginstrategy with includeallroles property to filter claims

### Features

* add option to verify all claims ([4199ea8](https://github.com/energywebfoundation/passport-did-auth/commit/4199ea84b46a77e4316893419cbb60afec60f0ad))
* add tests ([ec68e2f](https://github.com/energywebfoundation/passport-did-auth/commit/ec68e2f08c2772ca8cf18f73a94ce18c6ce63522))


### Bug Fixes

* correct comment ([3e23acd](https://github.com/energywebfoundation/passport-did-auth/commit/3e23acdeb94ddc845d5947098cd039daabc10707))
* filter claims before verification ([b1a2d24](https://github.com/energywebfoundation/passport-did-auth/commit/b1a2d242111aaa9c8817b0de970c950a38446797))
* update variable decalration name ([958ad3c](https://github.com/energywebfoundation/passport-did-auth/commit/958ad3c7db4380313a2f1488358d6ba0640133f2))
* validate if claimType exists ([3ba5e3f](https://github.com/energywebfoundation/passport-did-auth/commit/3ba5e3fee7caa981eef240e596057d2b3bda8fee))

## [2.0.0-alpha.17](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.16...v2.0.0-alpha.17) (2022-09-29)


### Bug Fixes

* add validation for accepted roles against uniqueroles ([418ef93](https://github.com/energywebfoundation/passport-did-auth/commit/418ef93157d809d9eca54cc0bdb5940ccb6f81e6))
* fixing a bug when DIDs with no roles are always accepted ([fbe6c71](https://github.com/energywebfoundation/passport-did-auth/commit/fbe6c71c6d2538d465ed8fb743cdbac7d16b2d47))

## [2.0.0-alpha.16](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.15...v2.0.0-alpha.16) (2022-09-14)


### Bug Fixes

* refactor role def resolution ([af4fc31](https://github.com/energywebfoundation/passport-did-auth/commit/af4fc31cd9152280c1b4608ccee8934f1b82e460))

## [2.0.0-alpha.15](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.14...v2.0.0-alpha.15) (2022-09-13)


### Features

* update logging ([30dd250](https://github.com/energywebfoundation/passport-did-auth/commit/30dd2509ddf2eba90a6959eda4f67868ae0eb3b9))

## [2.0.0-alpha.14](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.13...v2.0.0-alpha.14) (2022-09-09)


### Documentation

* update active maintainers ([b32124e](https://github.com/energywebfoundation/passport-did-auth/commit/b32124e86a3a39b6c636f240f13b2fce7fd36d7e))

## [2.0.0-alpha.13](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.12...v2.0.0-alpha.13) (2022-09-07)


### Features

* add status check for role credential ([a1f83e2](https://github.com/energywebfoundation/passport-did-auth/commit/a1f83e2d8f2ebc50613b348723214159b68e9122))
* update tests to validate credential status ([22340f4](https://github.com/energywebfoundation/passport-did-auth/commit/22340f45c29f37ffa0c5d3c762aa5100c79817b9))


### Bug Fixes

* apply formatting ([a984f7b](https://github.com/energywebfoundation/passport-did-auth/commit/a984f7bd77617a23d74cbc2044062206f9602eab))
* check for expiration date ([b50f337](https://github.com/energywebfoundation/passport-did-auth/commit/b50f337c23db92fe23dd7f8e9548d3a5eeec88a4))
* error validation ([8bb5f1e](https://github.com/energywebfoundation/passport-did-auth/commit/8bb5f1e91bbc6701ce627b20dd997873d2d9e9e6))

## [2.0.0-alpha.12](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.11...v2.0.0-alpha.12) (2022-09-01)


### Features

* enabling http keep-alive for the CacheServerClient ([#325](https://github.com/energywebfoundation/passport-did-auth/issues/325)) ([d449709](https://github.com/energywebfoundation/passport-did-auth/commit/d449709879a362566f1e054e0ff6199866559c8e))

## [2.0.0-alpha.11](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2022-08-25)


### Features

* export external dependencies ([0ab1f14](https://github.com/energywebfoundation/passport-did-auth/commit/0ab1f146ffb8de317677ebd5d4522e2fc88f6ce3))

## [2.0.0-alpha.10](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2022-08-25)


### Documentation

* add contract addr references and seq diagram ([2c6225d](https://github.com/energywebfoundation/passport-did-auth/commit/2c6225dea66543f976e569de561aa249c00ad254))

## [2.0.0-alpha.9](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2022-08-22)


### Bug Fixes

* fixing entire process crashing after LoginStrategy.getDidDocument throws an error ([2a5e772](https://github.com/energywebfoundation/passport-did-auth/commit/2a5e7720153a4d897225ea0e5e967afbdda6ed93))
* forcing node v14.17.0 for the `Lint source code` GHA ([6504074](https://github.com/energywebfoundation/passport-did-auth/commit/65040749d81f4cfe848029fe2f01a085413ca629))

## [2.0.0-alpha.8](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2022-08-16)


### Documentation

* add use case example for loginstrategy ([c1e8e66](https://github.com/energywebfoundation/passport-did-auth/commit/c1e8e666fdf6ce856128d6ba08c9020dedbb4545))

## [2.0.0-alpha.7](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2022-08-10)


### Features

* verify hierarchy of issuers for credential ([c160e19](https://github.com/energywebfoundation/passport-did-auth/commit/c160e19e2cf8eed68d73e3022f8bceec07a4f8be))


### Bug Fixes

* code refactoring ([1f2bfcc](https://github.com/energywebfoundation/passport-did-auth/commit/1f2bfcc7f2d9218a7a361eb71de19a75625a408b))
* resolve conflicts ([62a8b6d](https://github.com/energywebfoundation/passport-did-auth/commit/62a8b6dded417be044080f7b7d4cb1be45d63c6c))
* update package-lock.json ([3b96cfa](https://github.com/energywebfoundation/passport-did-auth/commit/3b96cfa63c2f15a2c5267e05f55e111ce95f1236))


### Documentation

* update class documentation ([35ce549](https://github.com/energywebfoundation/passport-did-auth/commit/35ce54954bcca71959f405b50cbc64de0f39916b))

## [2.0.0-alpha.6](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2022-07-08)


### Bug Fixes

* fetching off-chain claims from did document ([#304](https://github.com/energywebfoundation/passport-did-auth/issues/304)) ([a4c6999](https://github.com/energywebfoundation/passport-did-auth/commit/a4c699960d6dbbf75dc95b94bab906bd09eed6ef))

## [2.0.0-alpha.5](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2022-07-06)


### Bug Fixes

* add additional filters to off-chain claim filtering ([#303](https://github.com/energywebfoundation/passport-did-auth/issues/303)) ([77ff339](https://github.com/energywebfoundation/passport-did-auth/commit/77ff339663d600ca707e4c8c7d66dd7004fd83a5))

## [2.0.0-alpha.4](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2022-04-22)

## [2.0.0-alpha.3](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2022-04-21)


### Features

* add token payload validation ([cfde615](https://github.com/energywebfoundation/passport-did-auth/commit/cfde615ca2f4e3e22c8a8fa1b2204d5ad0c23961))

## [2.0.0-alpha.2](https://github.com/energywebfoundation/passport-did-auth/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2022-03-16)


### Bug Fixes

* compare stringified roles ([16166f1](https://github.com/energywebfoundation/passport-did-auth/commit/16166f1c5bbc169bfadeeed8d4e16ed4180d60b5))

## [2.0.0-alpha.1](https://github.com/energywebfoundation/passport-did-auth/compare/v1.3.0-alpha.6...v2.0.0-alpha.1) (2022-03-15)


### ⚠ BREAKING CHANGES

* ens registry must be set for LoginStrategy

### Bug Fixes

* read role from correspondig resolver ([cf1173b](https://github.com/energywebfoundation/passport-did-auth/commit/cf1173b3bb8f32970a1ebe07c9856373a2b218ee))

## [1.3.0-alpha.6](https://github.com/energywebfoundation/passport-did-auth/compare/v1.3.0-alpha.5...v1.3.0-alpha.6) (2022-02-25)

## [1.3.0-alpha.5](https://github.com/energywebfoundation/passport-did-auth/compare/v1.3.0-alpha.4...v1.3.0-alpha.5) (2022-02-23)
