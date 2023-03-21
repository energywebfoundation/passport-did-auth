import {
  EWC_CHAIN_ID,
  EWC_PUBLIC_RESOLVER_ADDRESS,
  EWC_RESOLVER_V2_ADDRESS,
  ResolverContractType,
  VOLTA_CHAIN_ID,
  VOLTA_PUBLIC_RESOLVER_ADDRESS,
  VOLTA_RESOLVER_V1_ADDRESS,
  VOLTA_RESOLVER_V2_ADDRESS,
} from '@energyweb/credential-governance';

export interface ResolverInfo {
  chainId: number;
  resolverType: ResolverContractType;
  address: string;
}

export const knownResolvers = [
  {
    chainId: VOLTA_CHAIN_ID,
    resolverType: ResolverContractType.PublicResolver,
    address: VOLTA_PUBLIC_RESOLVER_ADDRESS,
  },

  {
    chainId: VOLTA_CHAIN_ID,
    resolverType: ResolverContractType.RoleDefinitionResolver_v1,
    address: VOLTA_RESOLVER_V1_ADDRESS,
  },
  {
    chainId: VOLTA_CHAIN_ID,
    resolverType: ResolverContractType.RoleDefinitionResolver_v1,
    address: VOLTA_RESOLVER_V2_ADDRESS,
  },
  {
    chainId: EWC_CHAIN_ID,
    resolverType: ResolverContractType.PublicResolver,
    address: EWC_PUBLIC_RESOLVER_ADDRESS,
  },

  {
    chainId: EWC_CHAIN_ID,
    resolverType: ResolverContractType.RoleDefinitionResolver_v2,
    address: EWC_RESOLVER_V2_ADDRESS,
  },
];
