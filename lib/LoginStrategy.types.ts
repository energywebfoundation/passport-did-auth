import { IRoleDefinition } from '@energyweb/credential-governance';

export interface IRole {
  uid: string;
  name: string;
  namespace: string;
  owner: string;
  definition: IRoleDefinition;
}

export interface OffchainClaim {
  claimType: string;
  claimTypeVersion: number;
  issuedToken: string;
  iss?: string;
}

export interface DecodedToken {
  iss: string;
  claimData: Record<string, unknown>;
  sub: string;
}

export interface ITokenPayload extends DecodedToken {
  claimData: {
    blockNumber: number;
  };
  iss: string;
}
