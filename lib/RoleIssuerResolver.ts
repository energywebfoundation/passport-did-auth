import {
  DomainReader,
  IIssuerDefinition,
} from '@energyweb/credential-governance';
import { IssuerResolver } from '@energyweb/vc-verification';
import { providers } from 'ethers';
import { CacheServerClient } from './cacheServerClient';
import { EthersProviderIssuerResolver } from '@energyweb/vc-verification';
import { Logger } from './Logger';

/**
 * Resolves issuer definition from ssi-hub, if it is specified. Otherwise read form blockchain.
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
    if (this._cacheServerClient?.isAvailable) {
      const roleDef = await this._cacheServerClient.getRoleDefinition({
        namespace,
      });
      if (roleDef) {
        Logger.info(
          `IIssuerDefinition for namespace: ${namespace} fetched from SSI-Hub`
        );
        return roleDef.issuer;
      }
    }
    return await this._ethersProviderIssuerResolver.getIssuerDefinition(
      namespace
    );
  }
}
