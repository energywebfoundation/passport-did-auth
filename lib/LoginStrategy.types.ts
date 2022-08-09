import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { VerifiablePresentation } from '@ew-did-registry/credentials-interface';

export { IRoleDefinitionV2 };

export interface IRole {
  uid: string;
  name: string;
  namespace: string;
  owner: string;
  definition: IRoleDefinitionV2;
}

export interface Credential {
  issuedToken?: string;
  acceptedBy: string;
  claimType: string;
  claimTypeVersion: number;
  vp: VerifiablePresentation;
}

export interface ITokenPayload {
  claimData: {
    blockNumber: number;
  };
  iss: string;
}

export interface CredentialFilters {
  isAccepted?: boolean;
  namespace?: string;
}
