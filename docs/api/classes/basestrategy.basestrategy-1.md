# Class: BaseStrategy

[BaseStrategy](../modules/basestrategy.md).BaseStrategy

**`abstract`**

**`description`** passport strategy used to authenticate decetralized identity.
Subclasses should define their token extraction and validation logic

## Hierarchy

- `Strategy`

  ↳ **`BaseStrategy`**

  ↳↳ [`LoginStrategy`](loginstrategy.loginstrategy-1.md)

## Table of contents

### Constructors

- [constructor](basestrategy.basestrategy-1.md#constructor)

### Methods

- [authenticate](basestrategy.basestrategy-1.md#authenticate)
- [decodeToken](basestrategy.basestrategy-1.md#decodetoken)
- [extractToken](basestrategy.basestrategy-1.md#extracttoken)
- [getUserClaims](basestrategy.basestrategy-1.md#getuserclaims)
- [validate](basestrategy.basestrategy-1.md#validate)

## Constructors

### constructor

• **new BaseStrategy**(`__namedParameters`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`StrategyOptions`](../interfaces/basestrategy.strategyoptions.md) |

#### Overrides

Strategy.constructor

## Methods

### authenticate

▸ **authenticate**(`req`, `options`): `void`

**`description`** template method to authenticate DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |
| `options` | `AuthenticateOptions` |

#### Returns

`void`

#### Overrides

Strategy.authenticate

___

### decodeToken

▸ `Abstract` **decodeToken**(`token`): `string` \| { [key: string]: `any`;  }

**`abstract`**

**`description`** decodes token payload

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | encoded payload |

#### Returns

`string` \| { [key: string]: `any`;  }

decoded payload fields

___

### extractToken

▸ `Abstract` **extractToken**(`req`): ``null`` \| `string`

**`abstract`**

**`description`** extracts token from request

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> | object than encapsules request to protected endpoint |

#### Returns

``null`` \| `string`

encoded token

___

### getUserClaims

▸ `Abstract` **getUserClaims**(`did`): `Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

**`abstract`**

**`description`** fetches claims published by the did

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

___

### validate

▸ `Abstract` **validate**(`token`, `tokenPayload`, `done`): `void`

**`abstract`**

**`description`** contains token validation logic

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | serialized claims |
| `tokenPayload` | `any` | claim payload |
| `done` | (`err?`: `Error`, `user?`: `any`, `info?`: `any`) => `any` |  |

#### Returns

`void`
