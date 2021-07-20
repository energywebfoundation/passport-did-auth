# Class: LoginStrategy

[LoginStrategy](../modules/loginstrategy.md).LoginStrategy

## Hierarchy

- [`BaseStrategy`](basestrategy.basestrategy-1.md)

  ↳ **`LoginStrategy`**

## Table of contents

### Constructors

- [constructor](loginstrategy.loginstrategy-1.md#constructor)

### Methods

- [authenticate](loginstrategy.loginstrategy-1.md#authenticate)
- [decodeToken](loginstrategy.loginstrategy-1.md#decodetoken)
- [encodeToken](loginstrategy.loginstrategy-1.md#encodetoken)
- [extractToken](loginstrategy.loginstrategy-1.md#extracttoken)
- [getRoleDefinition](loginstrategy.loginstrategy-1.md#getroledefinition)
- [getUserClaims](loginstrategy.loginstrategy-1.md#getuserclaims)
- [validate](loginstrategy.loginstrategy-1.md#validate)

## Constructors

### constructor

• **new LoginStrategy**(`__namedParameters`, `_nestJsCB?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `LoginStrategyOptions` |
| `_nestJsCB?` | `VoidFunction` |

#### Overrides

[BaseStrategy](basestrategy.basestrategy-1.md).[constructor](basestrategy.basestrategy-1.md#constructor)

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

#### Inherited from

[BaseStrategy](basestrategy.basestrategy-1.md).[authenticate](basestrategy.basestrategy-1.md#authenticate)

___

### decodeToken

▸ **decodeToken**<`T`\>(`token`, `options?`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `options?` | `DecodeOptions` |

#### Returns

`T`

decoded payload fields

#### Overrides

[BaseStrategy](basestrategy.basestrategy-1.md).[decodeToken](basestrategy.basestrategy-1.md#decodetoken)

___

### encodeToken

▸ **encodeToken**(`data`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Record`<`string`, `unknown`\> | payload to encode |

#### Returns

`string`

___

### extractToken

▸ **extractToken**(`req`): ``null`` \| `string`

**`description`** extracts encoded payload either from request body or query

#### Parameters

| Name | Type |
| :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> |

#### Returns

``null`` \| `string`

encoded claim

#### Overrides

[BaseStrategy](basestrategy.basestrategy-1.md).[extractToken](basestrategy.basestrategy-1.md#extracttoken)

___

### getRoleDefinition

▸ **getRoleDefinition**(`namespace`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `namespace` | `string` |

#### Returns

`Promise`<`any`\>

___

### getUserClaims

▸ **getUserClaims**(`did`): `Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

#### Overrides

[BaseStrategy](basestrategy.basestrategy-1.md).[getUserClaims](basestrategy.basestrategy-1.md#getuserclaims)

___

### validate

▸ **validate**(`token`, `payload`, `done`): `Promise`<`void`\>

**`description`** verifies issuer signature, then check that claim issued
no latter then `this.numberOfBlocksBack` and user has enrolled with at
least one role

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `payload` | [`ITokenPayload`](../interfaces/loginstrategy_types.itokenpayload.md) |
| `done` | (`err?`: `Error`, `user?`: `any`, `info?`: `any`) => `void` |

#### Returns

`Promise`<`void`\>

#### Overrides

[BaseStrategy](basestrategy.basestrategy-1.md).[validate](basestrategy.basestrategy-1.md#validate)
