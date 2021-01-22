**[passport-did-auth](../README.md)**

> [Globals](../README.md) / LoginStrategy

# Class: LoginStrategy

## Hierarchy

* [BaseStrategy](basestrategy.md)

  ↳ **LoginStrategy**

## Index

### Constructors

* [constructor](loginstrategy.md#constructor)

### Properties

* [name](loginstrategy.md#name)

### Methods

* [authenticate](loginstrategy.md#authenticate)
* [decodeToken](loginstrategy.md#decodetoken)
* [encodeToken](loginstrategy.md#encodetoken)
* [error](loginstrategy.md#error)
* [extractToken](loginstrategy.md#extracttoken)
* [fail](loginstrategy.md#fail)
* [getDidsWithAcceptedRole](loginstrategy.md#getdidswithacceptedrole)
* [getRoleDefinition](loginstrategy.md#getroledefinition)
* [getUserClaims](loginstrategy.md#getuserclaims)
* [pass](loginstrategy.md#pass)
* [redirect](loginstrategy.md#redirect)
* [success](loginstrategy.md#success)
* [validate](loginstrategy.md#validate)
* [verifyRole](loginstrategy.md#verifyrole)

## Constructors

### constructor

\+ **new LoginStrategy**(`__namedParameters`: { acceptedRoles: string[] ; cacheServerUrl: string ; claimField: string = "claim"; didContractAddress: string = VoltaAddress1056; ensResolverAddress: string = "0x0a97e07c4Df22e2e31872F20C5BE191D5EFc4680"; ipfsUrl: string = "https://ipfs.infura.io:5001/api/v0/"; jwtSecret: string \| Buffer ; jwtSignOptions: SignOptions ; numberOfBlocksBack: number = 4; options: options ; rpcUrl: string  }, `_nestJsCB?`: VoidFunction): [LoginStrategy](loginstrategy.md)

*Overrides [BaseStrategy](basestrategy.md).[constructor](basestrategy.md#constructor)*

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { acceptedRoles: string[] ; cacheServerUrl: string ; claimField: string = "claim"; didContractAddress: string = VoltaAddress1056; ensResolverAddress: string = "0x0a97e07c4Df22e2e31872F20C5BE191D5EFc4680"; ipfsUrl: string = "https://ipfs.infura.io:5001/api/v0/"; jwtSecret: string \| Buffer ; jwtSignOptions: SignOptions ; numberOfBlocksBack: number = 4; options: options ; rpcUrl: string  } |
`_nestJsCB?` | VoidFunction |

**Returns:** [LoginStrategy](loginstrategy.md)

## Properties

### name

• `Optional` **name**: string

*Inherited from [BaseStrategy](basestrategy.md).[name](basestrategy.md#name)*

## Methods

### authenticate

▸ **authenticate**(`req`: Request, `options`: AuthenticateOptions): void

*Inherited from [BaseStrategy](basestrategy.md).[authenticate](basestrategy.md#authenticate)*

*Overrides void*

**`description`** template method to authenticate DID

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`req` | Request |  |
`options` | AuthenticateOptions |   |

**Returns:** void

___

### decodeToken

▸ **decodeToken**\<T>(`token`: string, `options?`: DecodeOptions): T

*Overrides [BaseStrategy](basestrategy.md).[decodeToken](basestrategy.md#decodetoken)*

#### Type parameters:

Name |
------ |
`T` |

#### Parameters:

Name | Type |
------ | ------ |
`token` | string |
`options?` | DecodeOptions |

**Returns:** T

___

### encodeToken

▸ **encodeToken**(`data`: any): string

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`data` | any | payload to encode |

**Returns:** string

___

### error

▸ **error**(`err`: any): void

*Inherited from [BaseStrategy](basestrategy.md).[error](basestrategy.md#error)*

Internal error while performing authentication.

Strategies should call this function when an internal error occurs
during the process of performing authentication; for example, if the
user directory is not available.

#### Parameters:

Name | Type |
------ | ------ |
`err` | any |

**Returns:** void

___

### extractToken

▸ **extractToken**(`req`: Request): any

*Overrides [BaseStrategy](basestrategy.md).[extractToken](basestrategy.md#extracttoken)*

**`description`** extracts encoded payload either from request body or query

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`req` | Request |   |

**Returns:** any

encoded claim

___

### fail

▸ **fail**(`challenge?`: string \| number, `status?`: number): void

*Inherited from [BaseStrategy](basestrategy.md).[fail](basestrategy.md#fail)*

Fail authentication, with optional `challenge` and `status`, defaulting
to 401.

Strategies should call this function to fail an authentication attempt.

#### Parameters:

Name | Type |
------ | ------ |
`challenge?` | string \| number |
`status?` | number |

**Returns:** void

___

### getDidsWithAcceptedRole

▸ **getDidsWithAcceptedRole**(`role`: string): Promise\<string[]>

#### Parameters:

Name | Type |
------ | ------ |
`role` | string |

**Returns:** Promise\<string[]>

___

### getRoleDefinition

▸ **getRoleDefinition**(`namespace`: string): Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)>

#### Parameters:

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)>

___

### getUserClaims

▸ **getUserClaims**(`did`: string): Promise\<[Claim](../interfaces/claim.md)[]>

*Overrides [BaseStrategy](basestrategy.md).[getUserClaims](basestrategy.md#getuserclaims)*

#### Parameters:

Name | Type |
------ | ------ |
`did` | string |

**Returns:** Promise\<[Claim](../interfaces/claim.md)[]>

___

### pass

▸ **pass**(): void

*Inherited from [BaseStrategy](basestrategy.md).[pass](basestrategy.md#pass)*

Pass without making a success or fail decision.

Under most circumstances, Strategies should not need to call this
function.  It exists primarily to allow previous authentication state
to be restored, for example from an HTTP session.

**Returns:** void

___

### redirect

▸ **redirect**(`url`: string, `status?`: number): void

*Inherited from [BaseStrategy](basestrategy.md).[redirect](basestrategy.md#redirect)*

Redirect to `url` with optional `status`, defaulting to 302.

Strategies should call this function to redirect the user (via their
user agent) to a third-party website for authentication.

#### Parameters:

Name | Type |
------ | ------ |
`url` | string |
`status?` | number |

**Returns:** void

___

### success

▸ **success**(`user`: object, `info?`: object): void

*Inherited from [BaseStrategy](basestrategy.md).[success](basestrategy.md#success)*

Authenticate `user`, with optional `info`.

Strategies should call this function to successfully authenticate a
user.  `user` should be an object supplied by the application after it
has been given an opportunity to verify credentials.  `info` is an
optional argument containing additional user information.  This is
useful for third-party authentication strategies to pass profile
details.

#### Parameters:

Name | Type |
------ | ------ |
`user` | object |
`info?` | object |

**Returns:** void

___

### validate

▸ **validate**(`token`: string, `payload`: [ITokenPayload](../interfaces/itokenpayload.md), `done`: (err?: Error, user?: any, info?: any) => void): Promise\<void>

*Overrides [BaseStrategy](basestrategy.md).[validate](basestrategy.md#validate)*

**`description`** verifies issuer signature, then check that claim issued
no latter then `this.numberOfBlocksBack` and user has enrolled with at
least one role

#### Parameters:

Name | Type |
------ | ------ |
`token` | string |
`payload` | [ITokenPayload](../interfaces/itokenpayload.md) |
`done` | (err?: Error, user?: any, info?: any) => void |

**Returns:** Promise\<void>

___

### verifyRole

▸ **verifyRole**(`__namedParameters`: { issuer: string ; namespace: string  }): Promise\<{ name: string = role.roleName; namespace: string  }>

**`description`** checks that role which corresponds to `namespace` is owned by the `issuer`

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { issuer: string ; namespace: string  } |

**Returns:** Promise\<{ name: string = role.roleName; namespace: string  }>
