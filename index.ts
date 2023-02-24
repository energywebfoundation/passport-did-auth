import { BaseStrategy } from './lib/BaseStrategy';
import { LoginStrategy } from './lib/LoginStrategy';
import { RoleCredentialResolver } from './lib/RoleCredentialResolver';
import { RoleIssuerResolver } from './lib/RoleIssuerResolver';
import { RoleRevokerResolver } from './lib/RoleRevokerResolver';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { Methods } from '@ew-did-registry/did';
import {
  DomainReader,
  EWC_CHAIN_ID,
  EWC_ADDRESS_1056,
  EWC_ENS_REGISTRY_ADDRESS,
  EWC_RESOLVER_V2_ADDRESS,
  ResolverContractType,
  VOLTA_CHAIN_ID,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_ERC_1056_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
} from '@energyweb/credential-governance';
import { ethrReg } from '@ew-did-registry/did-ethr-resolver';
import {
  RoleCredentialStatus,
  AuthorisedUser,
  RoleStatus,
  SiweReqPayload,
} from './lib/LoginStrategy.types';

export {
  AuthorisedUser,
  BaseStrategy,
  DidStore,
  DomainReader,
  ethrReg,
  EWC_CHAIN_ID,
  EWC_ADDRESS_1056,
  EWC_ENS_REGISTRY_ADDRESS,
  EWC_RESOLVER_V2_ADDRESS,
  LoginStrategy,
  Methods,
  RegistrySettings,
  RoleCredentialResolver,
  RoleCredentialStatus,
  RoleIssuerResolver,
  RoleRevokerResolver,
  RoleStatus,
  ResolverContractType,
  SiweReqPayload,
  VOLTA_CHAIN_ID,
  VOLTA_ERC_1056_ADDRESS,
  VOLTA_ENS_REGISTRY_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
};

export * from './lib/errors';
