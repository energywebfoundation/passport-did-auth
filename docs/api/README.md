**[passport-did-auth](README.md)**

> Globals

# passport-did-auth

## Index

### Classes

* [BaseStrategy](classes/basestrategy.md)
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
* [verifyClaim](README.md#verifyclaim)

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

▸ **lookup**(`obj`: {}, `field`: string): any

#### Parameters:

Name | Type |
------ | ------ |
`obj` | {} |
`field` | string |

**Returns:** any

___

### namehash

▸ **namehash**(`inputName`: string): string

#### Parameters:

Name | Type |
------ | ------ |
`inputName` | string |

**Returns:** string

___

### verifyClaim

▸ `Const`**verifyClaim**(`token`: string, `__namedParameters`: { iss: string  }): string

#### Parameters:

Name | Type |
------ | ------ |
`token` | string |
`__namedParameters` | { iss: string  } |

**Returns:** string
