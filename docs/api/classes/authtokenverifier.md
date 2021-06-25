**[passport-did-auth](../README.md)**

> [Globals](../README.md) / AuthTokenVerifier

# Class: AuthTokenVerifier

## Hierarchy

* **AuthTokenVerifier**

## Index

### Constructors

* [constructor](authtokenverifier.md#constructor)

### Methods

* [verify](authtokenverifier.md#verify)

## Constructors

### constructor

\+ **new AuthTokenVerifier**(`_privateKey`: string, `_didDocument`: IDIDDocument): [AuthTokenVerifier](authtokenverifier.md)

#### Parameters:

Name | Type |
------ | ------ |
`_privateKey` | string |
`_didDocument` | IDIDDocument |

**Returns:** [AuthTokenVerifier](authtokenverifier.md)

## Methods

### verify

▸ **verify**(`token`: string, `issuerDID`: string): Promise\<string>

**`description`** checks a token was signed by the issuer DID or a valid authentication delegate of the issuer

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`token` | string |  |
`issuerDID` | string |   |

**Returns:** Promise\<string>

issuer DID or null
