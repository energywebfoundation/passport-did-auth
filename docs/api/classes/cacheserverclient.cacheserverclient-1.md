# Class: CacheServerClient

[cacheServerClient](../modules/cacheserverclient.md).CacheServerClient

## Table of contents

### Constructors

- [constructor](cacheserverclient.cacheserverclient-1.md#constructor)

### Properties

- [address](cacheserverclient.cacheserverclient-1.md#address)

### Methods

- [addFailedRequest](cacheserverclient.cacheserverclient-1.md#addfailedrequest)
- [createLoginTokenHeadersAndPayload](cacheserverclient.cacheserverclient-1.md#createlogintokenheadersandpayload)
- [getDidDocument](cacheserverclient.cacheserverclient-1.md#getdiddocument)
- [getDidsWithAcceptedRole](cacheserverclient.cacheserverclient-1.md#getdidswithacceptedrole)
- [getRoleDefinition](cacheserverclient.cacheserverclient-1.md#getroledefinition)
- [getUserClaims](cacheserverclient.cacheserverclient-1.md#getuserclaims)
- [handleSuccessfulReLogin](cacheserverclient.cacheserverclient-1.md#handlesuccessfulrelogin)
- [handleUnauthorized](cacheserverclient.cacheserverclient-1.md#handleunauthorized)
- [login](cacheserverclient.cacheserverclient-1.md#login)

## Constructors

### constructor

• **new CacheServerClient**(`__namedParameters`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.privateKey` | `string` |
| `__namedParameters.provider` | `JsonRpcProvider` |
| `__namedParameters.url` | `string` |

## Properties

### address

• `Readonly` **address**: `string`

## Methods

### addFailedRequest

▸ **addFailedRequest**(`callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | (`token`: `string`) => `void` |

#### Returns

`void`

___

### createLoginTokenHeadersAndPayload

▸ **createLoginTokenHeadersAndPayload**(`__namedParameters`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.address` | `string` |
| `__namedParameters.blockNumber` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `encodedHeader` | `string` |
| `encodedPayload` | `string` |

___

### getDidDocument

▸ **getDidDocument**(`did`): `Promise`<`IDIDDocument`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`IDIDDocument`\>

___

### getDidsWithAcceptedRole

▸ **getDidsWithAcceptedRole**(`role`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `role` | `string` |

#### Returns

`Promise`<`string`[]\>

___

### getRoleDefinition

▸ **getRoleDefinition**(`__namedParameters`): `Promise`<[`IRoleDefinition`](../interfaces/loginstrategy_types.iroledefinition.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.namespace` | `string` |

#### Returns

`Promise`<[`IRoleDefinition`](../interfaces/loginstrategy_types.iroledefinition.md)\>

___

### getUserClaims

▸ **getUserClaims**(`__namedParameters`): `Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.did` | `string` |

#### Returns

`Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\>

___

### handleSuccessfulReLogin

▸ **handleSuccessfulReLogin**(`token`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |

#### Returns

`void`

___

### handleUnauthorized

▸ **handleUnauthorized**(`error`): `Promise`<`unknown`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `AxiosError`<`any`\> |

#### Returns

`Promise`<`unknown`\>

___

### login

▸ **login**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>
