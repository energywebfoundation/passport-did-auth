import {
  DomainReader,
  IIssuerDefinition,
} from '@energyweb/credential-governance';
import { IssuerResolver } from '@energyweb/vc-verification';
import { providers, utils } from 'ethers';
import { CacheServerClient } from './cacheServerClient';
import { EthersProviderIssuerResolver } from '@energyweb/vc-verification';

/**
 * Resolves issuers definition by either by reading smart contract state via an Ethers provider or from ssi-hub (cache server)
 */
export class RoleIssuerResolver implements IssuerResolver {
  private _cacheServerClient?: CacheServerClient;
  private _ethersProviderIssuerResolver: EthersProviderIssuerResolver;

  constructor(
    domainReader: DomainReader,
    provider?: providers.Provider,
    userPrivateKey?: string,
    cacheServerUrl?: string
  ) {
    this._ethersProviderIssuerResolver = new EthersProviderIssuerResolver(
      domainReader
    );
    if (userPrivateKey && cacheServerUrl && provider) {
      this._cacheServerClient = new CacheServerClient({
        privateKey: userPrivateKey,
        provider,
        url: cacheServerUrl,
      });
      this._cacheServerClient.login();
    }
  }

  /**
   * Fetches authorised issuers for the provided namespace
   *
   * ```typescript
   * const issuerResolver = new RoleIssuerResolver(domainReader, provider, userPrivateKey, cacheServerUrl);
   * const role = 'sampleRole';
   * const issuers = issuerResolver.getIssuerDefinition(sampleRole);
   * ```
   * @param namespace role for which the issuers need to be fetched
   * @returns IIssuerDefinition for the namespace from blockchain contract
   */
  async getIssuerDefinition(
    namespace: string
  ): Promise<IIssuerDefinition | undefined> {
    const resolvedNamespace = namespace.startsWith('0x')
      ? namespace
      : utils.namehash(namespace);

    if (this._cacheServerClient?.isAvailable) {
      return (
        await this._cacheServerClient.getRoleDefinition({
          namespace: resolvedNamespace,
        })
      ).issuer;
    }
    return await this._ethersProviderIssuerResolver.getIssuerDefinition(
      resolvedNamespace
    );
  }
}
