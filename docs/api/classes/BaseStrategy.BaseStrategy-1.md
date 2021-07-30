# Class: BaseStrategy

[BaseStrategy](../modules/BaseStrategy.md).BaseStrategy

**`abstract`**

**`description`** passport strategy used to authenticate decetralized identity.
Subclasses should define their token extraction and validation logic

## Hierarchy

- `Strategy`

  ↳ **`BaseStrategy`**

  ↳↳ [`LoginStrategy`](LoginStrategy.LoginStrategy-1.md)

## Table of contents

### Constructors

- [constructor](BaseStrategy.BaseStrategy-1.md#constructor)

### Methods

- [authenticate](BaseStrategy.BaseStrategy-1.md#authenticate)
- [decodeToken](BaseStrategy.BaseStrategy-1.md#decodetoken)
- [extractToken](BaseStrategy.BaseStrategy-1.md#extracttoken)
- [getUserClaims](BaseStrategy.BaseStrategy-1.md#getuserclaims)
- [validate](BaseStrategy.BaseStrategy-1.md#validate)

## Constructors

### constructor

• **new BaseStrategy**(`__namedParameters`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`StrategyOptions`](../interfaces/BaseStrategy.StrategyOptions.md) |

#### Overrides

Strategy.constructor

## Methods

### authenticate

▸ **authenticate**(`req`): `void`

**`description`** template method to authenticate DID

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |

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

▸ `Abstract` **getUserClaims**(`did`): `Promise`<[`Claim`](../interfaces/LoginStrategy_types.Claim.md)[]\>

**`abstract`**

**`description`** fetches claims published by the did

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<[`Claim`](../interfaces/LoginStrategy_types.Claim.md)[]\>

___

### validate

▸ `Abstract` **validate**(`token`, `tokenPayload`, `done`): `void`

**`abstract`**

**`description`** contains token validation logic

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `token` | `string` | serialized claims |
| `tokenPayload` | `string` \| { [key: string]: `any`;  } | claim payload |
| `done` | (`err?`: `Error`, `user?`: `any`, `info?`: `any`) => `any` |  |

#### Returns

`void`
