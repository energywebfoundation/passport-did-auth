# Class: AuthTokenVerifier

[AuthTokenVerifier](../modules/authtokenverifier.md).AuthTokenVerifier

## Table of contents

### Constructors

- [constructor](authtokenverifier.authtokenverifier-1.md#constructor)

### Methods

- [verify](authtokenverifier.authtokenverifier-1.md#verify)

## Constructors

### constructor

• **new AuthTokenVerifier**(`_privateKey`, `_didDocument`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_privateKey` | `string` |
| `_didDocument` | `IDIDDocument` |

## Methods

### verify

▸ **verify**(`token`, `issuerDID`): `Promise`<``null`` \| `string`\>

**`description`** checks a token was signed by the issuer DID or a valid authentication delegate of the issuer

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `issuerDID` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

issuer DID or null
