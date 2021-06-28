**[passport-did-auth](README.md)**

> Globals

# passport-did-auth

## Index

### Classes

* [AuthTokenVerifier](classes/authtokenverifier.md)
* [BaseStrategy](classes/basestrategy.md)
* [CacheServerClient](classes/cacheserverclient.md)
* [ClaimVerifier](classes/claimverifier.md)
* [LoginStrategy](classes/loginstrategy.md)

### Interfaces

* [Claim](interfaces/claim.md)
* [DecodedToken](interfaces/decodedtoken.md)
* [IRole](interfaces/irole.md)
* [IRoleDefinition](interfaces/iroledefinition.md)
* [ITokenPayload](interfaces/itokenpayload.md)
* [LoginStrategyOptions](interfaces/loginstrategyoptions.md)
* [StrategyOptions](interfaces/strategyoptions.md)

### Variables

* [abi1056](README.md#abi1056)
* [sha3](README.md#sha3)

### Functions

* [decodeLabelhash](README.md#decodelabelhash)
* [isEncodedLabelhash](README.md#isencodedlabelhash)
* [labelhash](README.md#labelhash)
* [lookup](README.md#lookup)
* [namehash](README.md#namehash)

## Variables

### abi1056

•  **abi1056**: ({ anonymous?: undefined ; constant: boolean ; inputs: { name: string ; type: string  }[] ; name: string ; outputs: { name: string ; type: string  }[] ; payable: boolean ; stateMutability: string ; type: string  } \| { anonymous: boolean ; constant?: undefined ; inputs: { indexed: boolean ; name: string ; type: string  }[] ; name: string ; outputs?: undefined ; payable?: undefined ; stateMutability?: undefined ; type: string  })[]

___

### sha3

• `Const` **sha3**: any = require('js-sha3').keccak\_256

## Functions

### decodeLabelhash

▸ **decodeLabelhash**(`hash`: string): string

#### Parameters:

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** string

___

### isEncodedLabelhash

▸ **isEncodedLabelhash**(`hash`: string): boolean

#### Parameters:

Name | Type |
------ | ------ |
`hash` | string |

**Returns:** boolean

___

### labelhash

▸ **labelhash**(`unnormalizedLabelOrLabelhash`: string): string

#### Parameters:

Name | Type |
------ | ------ |
`unnormalizedLabelOrLabelhash` | string |

**Returns:** string

___

### lookup

▸ **lookup**(`obj`: {}, `field`: string): string \| null

#### Parameters:

Name | Type |
------ | ------ |
`obj` | {} |
`field` | string |

**Returns:** string \| null

___

### namehash

▸ **namehash**(`inputName`: string): string

#### Parameters:

Name | Type |
------ | ------ |
`inputName` | string |

**Returns:** string
