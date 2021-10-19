# Interface: IRoleDefinition

[LoginStrategy.types](../modules/LoginStrategy_types.md).IRoleDefinition

## Table of contents

### Properties

- [fields](LoginStrategy_types.IRoleDefinition.md#fields)
- [issuer](LoginStrategy_types.IRoleDefinition.md#issuer)
- [metadata](LoginStrategy_types.IRoleDefinition.md#metadata)
- [roleName](LoginStrategy_types.IRoleDefinition.md#rolename)
- [roleType](LoginStrategy_types.IRoleDefinition.md#roletype)
- [version](LoginStrategy_types.IRoleDefinition.md#version)

## Properties

### fields

• **fields**: { `fieldType`: `string` ; `label`: `string` ; `validation`: `string`  }[]

___

### issuer

• **issuer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `did?` | `string`[] |
| `issuerType?` | `string` |
| `roleName?` | `string` |
|

> Description  


<kbd>did</kbd>
: An array containing the list of DIDs referenced as valid issuers for this role.
```typescript
...
issuer : {
    did : [
        `did:ethr:0xC3571714248588C6E19cDECe2778B75341b2c288`,
        `did:ethr:0x96339b0B2CBAE8F0E0d416e03c32d57c596B1d90`
    ],
    issuerType : ... ,
    roleName : ... ,
}
...
```

<kbd>issuerType</kbd>
: Determines how the role verifying process will check if a issuer is valid for a given role.
- If issuerType ==  "`DID`", validating a issuer role will be done by checking if a given `did` is referenced in the list of dids.


```typescript
...
issuer : {
    did : [
        `did:ethr:0xC3571714248588C6E19cDECe2778B75341b2c288`,
        `did:ethr:0x96339b0B2CBAE8F0E0d416e03c32d57c596B1d90`,
    ],
    issuerType : "DID",
    roleName : ... ,
}
...
```

- If issuerType ==  "`Role`", validating a issuer role will be done by checking if the claiming did has this `role`.

```typescript
...
issuer : {
    did : [
        ...
    ],
    issuerType : "Role",
    roleName : installer , //any did with the installer Role will be considered as a valid issuer
}
...
```

<kbd>roleName</kbd>
: Name of the role
___

### metadata

• **metadata**: `Record`<`string`, `unknown`\> \| `Record`<`string`, `unknown`\>[]

___

### roleName

• **roleName**: `string`

___

### roleType

• **roleType**: `string`

___

### version

• **version**: `string`
