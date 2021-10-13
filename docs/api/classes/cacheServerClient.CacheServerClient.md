# Class: CacheServerClient

[cacheServerClient](../modules/cacheServerClient.md).CacheServerClient

## Table of contents

### Constructors

- [constructor](cacheServerClient.CacheServerClient.md#constructor)

### Properties

- [address](cacheServerClient.CacheServerClient.md#address)

### Methods

- [addFailedRequest](cacheServerClient.CacheServerClient.md#addfailedrequest)
- [createLoginTokenHeadersAndPayload](cacheServerClient.CacheServerClient.md#createlogintokenheadersandpayload)
- [getDidDocument](cacheServerClient.CacheServerClient.md#getdiddocument)
- [getDidsWithAcceptedRole](cacheServerClient.CacheServerClient.md#getdidswithacceptedrole)
- [getRoleDefinition](cacheServerClient.CacheServerClient.md#getroledefinition)
- [getUserClaims](cacheServerClient.CacheServerClient.md#getuserclaims)
- [handleSuccessfulReLogin](cacheServerClient.CacheServerClient.md#handlesuccessfulrelogin)
- [handleUnauthorized](cacheServerClient.CacheServerClient.md#handleunauthorized)
- [login](cacheServerClient.CacheServerClient.md#login)

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

▸ **getRoleDefinition**(`__namedParameters`): `Promise`<[`IRoleDefinition`](../interfaces/LoginStrategy_types.IRoleDefinition.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.namespace` | `string` |

#### Returns

`Promise`<[`IRoleDefinition`](../interfaces/LoginStrategy_types.IRoleDefinition.md)\>

___

### getUserClaims

▸ **getUserClaims**(`__namedParameters`): `Promise`<[`Claim`](../interfaces/LoginStrategy_types.Claim.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.did` | `string` |

#### Returns

`Promise`<[`Claim`](../interfaces/LoginStrategy_types.Claim.md)[]\>

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
