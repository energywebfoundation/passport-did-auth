**[passport-did-auth](../README.md)**

> [Globals](../README.md) / BaseStrategy

# Class: BaseStrategy

**`abstract`** 

**`description`** passport strategy used to authenticate decetralized identity.
Subclasses should define their token extraction and validation logic

## Hierarchy

* Strategy\<this> & StrategyCreatedStatic

  ↳ **BaseStrategy**

  ↳↳ [LoginStrategy](loginstrategy.md)

## Index

### Constructors

* [constructor](basestrategy.md#constructor)

### Properties

* [name](basestrategy.md#name)

### Methods

* [authenticate](basestrategy.md#authenticate)
* [decodeToken](basestrategy.md#decodetoken)
* [error](basestrategy.md#error)
* [extractToken](basestrategy.md#extracttoken)
* [fail](basestrategy.md#fail)
* [getUserClaims](basestrategy.md#getuserclaims)
* [pass](basestrategy.md#pass)
* [redirect](basestrategy.md#redirect)
* [success](basestrategy.md#success)
* [validate](basestrategy.md#validate)

## Constructors

### constructor

\+ **new BaseStrategy**(`__namedParameters`: { name: string  }): [BaseStrategy](basestrategy.md)

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { name: string  } |

**Returns:** [BaseStrategy](basestrategy.md)

## Properties

### name

• `Optional` **name**: string

*Inherited from [BaseStrategy](basestrategy.md).[name](basestrategy.md#name)*

## Methods

### authenticate

▸ **authenticate**(`req`: Request, `options`: AuthenticateOptions): void

*Overrides void*

#### Parameters:

Name | Type |
------ | ------ |
`req` | Request |
`options` | AuthenticateOptions |

**Returns:** void

___

### decodeToken

▸ `Abstract`**decodeToken**(`token`: string): string \| { [key:string]: any;  }

**`description`** decodes token payload

**`abstract`** 

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`token` | string |   |

**Returns:** string \| { [key:string]: any;  }

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

▸ `Abstract`**extractToken**(`req`: Request): string

**`abstract`** 

**`description`** extracts token from request

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`req` | Request | object than encapsules request to protected endpoint  |

**Returns:** string

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

### getUserClaims

▸ `Abstract`**getUserClaims**(`did`: string): Promise\<[Claim](../interfaces/claim.md)[]>

**`abstract`** 

**`description`** fetches claims published by the did

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`did` | string |   |

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

▸ `Abstract`**validate**(`token`: string, `tokenPayload`: any, `done`: (err?: Error, user?: any, info?: any) => any): void

**`abstract`** 

**`description`** contains token validation logic

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`token` | string | serialized claims |
`tokenPayload` | any | claim payload |
`done` | (err?: Error, user?: any, info?: any) => any |   |

**Returns:** void
