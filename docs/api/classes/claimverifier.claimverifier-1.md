# Class: ClaimVerifier

[ClaimVerifier](../modules/claimverifier.md).ClaimVerifier

## Table of contents

### Constructors

- [constructor](claimverifier.claimverifier-1.md#constructor)

### Methods

- [getVerifiedRoles](claimverifier.claimverifier-1.md#getverifiedroles)
- [verifyRole](claimverifier.claimverifier-1.md#verifyrole)

## Constructors

### constructor

• **new ClaimVerifier**(`claims`, `getRoleDefinition`, `getUserClaims`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `claims` | [`Claim`](../interfaces/loginstrategy_types.claim.md)[] |
| `getRoleDefinition` | (`namespace`: `string`) => `Promise`<[`IRoleDefinition`](../interfaces/loginstrategy_types.iroledefinition.md)\> |
| `getUserClaims` | (`did`: `string`) => `Promise`<[`Claim`](../interfaces/loginstrategy_types.claim.md)[]\> |

## Methods

### getVerifiedRoles

▸ **getVerifiedRoles**(): `Promise`<{ `name`: `any` ; `namespace`: `string`  }[]\>

#### Returns

`Promise`<{ `name`: `any` ; `namespace`: `string`  }[]\>

___

### verifyRole

▸ **verifyRole**(`__namedParameters`): `Promise`<``null`` \| { `name`: `string` ; `namespace`: `string`  }\>

**`description`** checks that role which corresponds to `namespace` is owned by the `issuer`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.issuer` | `string` |
| `__namedParameters.namespace` | `string` |
| `__namedParameters.version?` | `string` |

#### Returns

`Promise`<``null`` \| { `name`: `string` ; `namespace`: `string`  }\>
