export interface IRoleDefinition {
  version: string
  roleType: string
  roleName: string
  fields: {
    fieldType: string
    label: string
    validation: string
  }[]
  metadata: Record<string, unknown> | Record<string, unknown>[]
  issuer: {
    issuerType?: string
    did?: string[]
    roleName?: string
  }
}

export interface IRole {
  uid: string
  name: string
  namespace: string
  owner: string
  definition: IRoleDefinition
}

export interface Claim {
  claimType?: string
  claimTypeVersion?: string
  issuedToken?: string,
  iss?: string
}

export interface DecodedToken {
  iss: string
  claimData: Record<string, unknown>
  sub: string
}

export interface ITokenPayload extends DecodedToken {
  claimData: {
    blockNumber: number
  }
  iss: string
}
