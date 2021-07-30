# Class: ClaimVerifier

[ClaimVerifier](../modules/ClaimVerifier.md).ClaimVerifier

## Table of contents

### Constructors

- [constructor](ClaimVerifier.ClaimVerifier-1.md#constructor)

### Methods

- [getVerifiedRoles](ClaimVerifier.ClaimVerifier-1.md#getverifiedroles)
- [verifyRole](ClaimVerifier.ClaimVerifier-1.md#verifyrole)

## Constructors

### constructor

• **new ClaimVerifier**(`claims`, `getRoleDefinition`, `getUserClaims`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `claims` | [`Claim`](../interfaces/LoginStrategy_types.Claim.md)[] |
| `getRoleDefinition` | (`namespace`: `string`) => `Promise`<[`IRoleDefinition`](../interfaces/LoginStrategy_types.IRoleDefinition.md)\> |
| `getUserClaims` | (`did`: `string`) => `Promise`<[`Claim`](../interfaces/LoginStrategy_types.Claim.md)[]\> |

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
