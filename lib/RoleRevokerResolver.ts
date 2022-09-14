import {
  DomainReader,
  IRevokerDefinition,
} from '@energyweb/credential-governance';
import {
  EthersProviderRevokerResolver,
  RevokerResolver,
} from '@energyweb/vc-verification';
import { providers } from 'ethers';
import { CacheServerClient } from './cacheServerClient';
import { Logger } from './Logger';

/**
 * Resolves revoker definition from ssi-hub, if it is specified. Otherwise read form blockchain.
 */
export class RoleRevokerResolver implements RevokerResolver {
  private _cacheServerClient?: CacheServerClient;
  private _ethersProviderRevokerResolver: EthersProviderRevokerResolver;

  constructor(
    domainReader: DomainReader,
    provider?: providers.Provider,
    userPrivateKey?: string,
    cacheServerUrl?: string
  ) {
    this._ethersProviderRevokerResolver = new EthersProviderRevokerResolver(
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
   * Fetches revokers for the namespace / role
   *
   * ```typescript
   * const revokerResolver = new RoleRevokerResolver(domainReader, provider, userPrivateKey, cacheServerUrl);
   * const role = 'sampleRole';
   * const revokers = revokerResolver.getRevokerDefinition(role);
   * ```
   * @param namespace role for which revokers need to be fetched
   * @returns IRevokerDefinition for the namespace from blockchain contract
   */
  async getRevokerDefinition(
    namespace: string
  ): Promise<IRevokerDefinition | undefined> {
    if (this._cacheServerClient?.isAvailable) {
      const roleDef = await this._cacheServerClient.getRoleDefinition({
        namespace,
      });
      if (roleDef) {
        Logger.info(
          `IRevokerDefinition for namespace: ${namespace} fetched from SSI-Hub`
        );
        return roleDef.revoker;
      }
    }
    return await this._ethersProviderRevokerResolver.getRevokerDefinition(
      namespace
    );
  }
}
