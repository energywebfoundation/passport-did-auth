import { IRoleDefinitionV2 } from '@energyweb/credential-governance';
import { VerifiablePresentation } from '@ew-did-registry/credentials-interface';
import type { SiweMessage as SiweMessagePayload } from 'siwe';

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

export interface SiweReqPayload {
  signature: string;
  message: Partial<SiweMessagePayload>;
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
