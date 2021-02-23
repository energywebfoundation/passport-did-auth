**[passport-did-auth](../README.md)**

> [Globals](../README.md) / ClaimVerifier

# Class: ClaimVerifier

## Hierarchy

* **ClaimVerifier**

## Index

### Constructors

* [constructor](claimverifier.md#constructor)

### Methods

* [getVerifiedRoles](claimverifier.md#getverifiedroles)
* [verifyRole](claimverifier.md#verifyrole)

## Constructors

### constructor

\+ **new ClaimVerifier**(`claims`: [Claim](../interfaces/claim.md)[], `getRoleDefinition`: (namespace: string) => Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)>, `getUserClaims`: (did: string) => Promise\<[Claim](../interfaces/claim.md)[]>): [ClaimVerifier](claimverifier.md)

#### Parameters:

Name | Type |
------ | ------ |
`claims` | [Claim](../interfaces/claim.md)[] |
`getRoleDefinition` | (namespace: string) => Promise\<[IRoleDefinition](../interfaces/iroledefinition.md)> |
`getUserClaims` | (did: string) => Promise\<[Claim](../interfaces/claim.md)[]> |

**Returns:** [ClaimVerifier](claimverifier.md)

## Methods

### getVerifiedRoles

▸ **getVerifiedRoles**(): Promise\<{ name: any ; namespace: string  }[]>

**Returns:** Promise\<{ name: any ; namespace: string  }[]>

___

### verifyRole

▸ **verifyRole**(`__namedParameters`: { issuer: string ; namespace: string ; version: string  }): Promise\<{ name: string ; namespace: string  }>

**`description`** checks that role which corresponds to `namespace` is owned by the `issuer`

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { issuer: string ; namespace: string ; version: string  } |

**Returns:** Promise\<{ name: string ; namespace: string  }>
