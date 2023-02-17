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

export interface ISiweMessagePayload {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
}

export interface CredentialFilters {
  isAccepted?: boolean;
  namespace?: string;
}

export enum RoleCredentialStatus {
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  VALID = 'valid',
  NOROLE = 'no role credential',
  UNKNOWN = 'unknown error',
}

export const ErrorMessageMap = {
  'Credential has expired': RoleCredentialStatus.EXPIRED,
  'Credential has been revoked': RoleCredentialStatus.REVOKED,
};

export interface RoleStatus {
  name: string;
  namespace: string;
  status: RoleCredentialStatus;
}

export interface AuthorisedUser {
  did: string;
  userRoles: RoleStatus[];
  authorisationStatus: boolean;
}
