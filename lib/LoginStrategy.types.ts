import { IRoleDefinitionV2 } from '@energyweb/credential-governance';

export { IRoleDefinitionV2 };

export interface IRole {
  uid: string;
  name: string;
  namespace: string;
  owner: string;
  definition: IRoleDefinitionV2;
}

export interface OffchainClaim {
  claimType: string;
  claimTypeVersion: number;
  iss: string;
}

export interface DecodedToken {
  iss: string;
  claimData: Record<string, unknown>;
  sub: string;
}

export interface ITokenPayload {
  claimData: {
    blockNumber: number;
  };
  iss: string;
}
