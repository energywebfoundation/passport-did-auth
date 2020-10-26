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
  uid: string
  id: string
  requester: string
  claimIssuer: string[]
  claimType: string
  token: string
  issuedToken?: string
  isAccepted: boolean
  createdAt: string
  parentNamespace: string
  acceptedBy?: string
  iss?: string
}

export interface DecodedToken {
  iss: string;
  claimData: Record<string, unknown>;
  sub: string;
}

export interface ITokenPayload extends DecodedToken {
  claimData: {
    blockNumber: number;
    roleClaims: Claim[]
  }
}
