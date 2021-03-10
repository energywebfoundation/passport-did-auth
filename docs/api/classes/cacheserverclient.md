**[passport-did-auth](../README.md)**

> [Globals](../README.md) / CacheServerClient

# Class: CacheServerClient

## Hierarchy

* **CacheServerClient**

## Index

### Constructors

* [constructor](cacheserverclient.md#constructor)

### Properties

* [address](cacheserverclient.md#address)

### Methods

* [addFailedRequest](cacheserverclient.md#addfailedrequest)
* [createLoginTokenHeadersAndPayload](cacheserverclient.md#createlogintokenheadersandpayload)
* [getDidsWithAcceptedRole](cacheserverclient.md#getdidswithacceptedrole)
* [getRoleDefinition](cacheserverclient.md#getroledefinition)
* [getUserClaims](cacheserverclient.md#getuserclaims)
* [handleSuccessfulReLogin](cacheserverclient.md#handlesuccessfulrelogin)
* [handleUnauthorized](cacheserverclient.md#handleunauthorized)
* [login](cacheserverclient.md#login)

## Constructors

### constructor

\+ **new CacheServerClient**(`__namedParameters`: { privateKey: string ; provider: JsonRpcProvider ; url: string  }): [CacheServerClient](cacheserverclient.md)

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { privateKey: string ; provider: JsonRpcProvider ; url: string  } |

**Returns:** [CacheServerClient](cacheserverclient.md)

## Properties

### address

• `Readonly` **address**: string

## Methods

### addFailedRequest

▸ **addFailedRequest**(`callback`: (token: string) => void): void

#### Parameters:

Name | Type |
------ | ------ |
`callback` | (token: string) => void |

**Returns:** void

___

### createLoginTokenHeadersAndPayload

▸ **createLoginTokenHeadersAndPayload**(`__namedParameters`: { address: string ; blockNumber: number  }): object

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { address: string ; blockNumber: number  } |

**Returns:** object

Name | Type |
------ | ------ |
`encodedHeader` | string |
`encodedPayload` | string |

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

▸ **getRoleDefinition**(`__namedParameters`: { namespace: string  }): Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)>

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { namespace: string  } |

**Returns:** Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)>

___

### getUserClaims

▸ **getUserClaims**(`__namedParameters`: { did: string  }): Promise\<[Claim](../interfaces/claim.md)[]>

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { did: string  } |

**Returns:** Promise\<[Claim](../interfaces/claim.md)[]>

___

### handleSuccessfulReLogin

▸ **handleSuccessfulReLogin**(`token`: string): void

#### Parameters:

Name | Type |
------ | ------ |
`token` | string |

**Returns:** void

___

### handleUnauthorized

▸ **handleUnauthorized**(`error`: AxiosError): Promise\<unknown>

#### Parameters:

Name | Type |
------ | ------ |
`error` | AxiosError |

**Returns:** Promise\<unknown>

___

### login

▸ **login**(): Promise\<string>

**Returns:** Promise\<string>
