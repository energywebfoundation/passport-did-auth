import { RoleCredentialSubject } from '@energyweb/credential-governance';
import {
  CredentialResolver,
  RoleEIP191JWT,
  RolePayload,
  VerifiableCredential,
  IRoleCredentialCache,
  IpfsCredentialResolver,
  isEIP191Jwt,
  isVerifiableCredential,
  transformClaim,
  filterOutMaliciousClaims,
  isCID,
  IDIDDocumentCache,
} from '@energyweb/vc-verification';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import {
  IDIDDocument,
  RegistrySettings,
} from '@ew-did-registry/did-resolver-interface';
import { providers, utils } from 'ethers';
import { CacheServerClient } from './cacheServerClient';
import { decode } from 'jsonwebtoken';
import { Logger } from './Logger';

/**
 * Resolved subject credential from ssi-hub, if is is specied.
 * Otherwise resolves credential from blockchain.
 */
export class RoleCredentialResolver implements CredentialResolver {
  private _cacheServerClient?: CacheServerClient;
  private _ipfsCredentialResolver: IpfsCredentialResolver;
  private _ipfsStore: DidStore;

  constructor(
    provider: providers.Provider,
    registrySetting: RegistrySettings,
    didStore: DidStore,
    privateKey?: string,
    cacheServerUrl?: string
  ) {
    this._ipfsStore = didStore;
    this._ipfsCredentialResolver = new IpfsCredentialResolver(
      provider,
      registrySetting,
      didStore
    );
    if (privateKey && cacheServerUrl) {
      this._cacheServerClient = new CacheServerClient({
        privateKey,
        provider,
        url: cacheServerUrl,
      });
      this._cacheServerClient.login();
    }
  }

  /**
   * Fetches credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getCredential('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @param roleCredentialCache Cache to store role credentials
   * @param didDocumentCache Cache to store DID Documents
   * @returns
   */
  async getCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<
    VerifiableCredential<RoleCredentialSubject> | RoleEIP191JWT | undefined
  > {
    let credential:
      | VerifiableCredential<RoleCredentialSubject>
      | RoleEIP191JWT
      | undefined;
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (cachedRoleCredential) {
      return cachedRoleCredential;
    }
    credential = await this.getVerifiableCredential(
      did,
      namespace,
      roleCredentialCache,
      didDocumentCache
    );
    if (!credential) {
      credential = await this.getEIP191JWT(
        did,
        namespace,
        roleCredentialCache,
        didDocumentCache
      );
    }
    return credential;
  }

  /**
   * Fetches Verifiable Credential for the given did and role for a vc issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getVerifiableCredential('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential needs to be fetched
   * @param namespace role for which the credential needs to be fetched
   * @param roleCredentialCache Cache to store role credentials. Cache is updated with all credentials retrieved for the DID
   * @param didDocumentCache Cache to store DID Documents
   * @returns
   */
  async getVerifiableCredential(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ) {
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (isVerifiableCredential(cachedRoleCredential)) {
      return cachedRoleCredential;
    }
    const credentials = await this.credentialsOf(did, didDocumentCache);
    credentials.forEach((credential) =>
      roleCredentialCache?.setRoleCredential(
        did,
        credential.credentialSubject.role.namespace,
        credential
      )
    );
    return credentials.find(
      (claim) =>
        claim.credentialSubject.role.namespace === namespace ||
        utils.namehash(claim.credentialSubject.role.namespace) === namespace
    );
  }

  /**
   * Fetches RoleEIP191JWT for the given did and role for an OffChainClaim issuance hierarchy
   *
   * ```typescript
   * const credentialResolver = new IpfsCredentialResolver(
   *  provider,
   *  registrySettings,
   *  didStore );
   * const credential = credentialResolver.getEIP191JWT('did:ethr:1234', 'sampleRole', roleCredentialCache, didDocumentCache);
   * ```
   *
   * @param did subject DID for which the credential to be fetched
   * @param namespace role for which the credential need to be fetched
   * @param roleCredentialCache Cache to store role credentials. Cache is updated with all credentials retrieved for the
   * @param didDocumentCache Cache to store DID Documents
   * @returns RoleEIP191JWT
   */
  async getEIP191JWT(
    did: string,
    namespace: string,
    roleCredentialCache?: IRoleCredentialCache,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT | undefined> {
    const cachedRoleCredential = roleCredentialCache?.getRoleCredential(
      did,
      namespace
    );
    if (isEIP191Jwt(cachedRoleCredential)) {
      return cachedRoleCredential;
    }
    const eip191Jwts = await this.eip191JwtsOf(did, didDocumentCache);
    eip191Jwts.forEach((eip191Jwt) => {
      const claimType = eip191Jwt?.payload?.claimData?.claimType;
      if (claimType) {
        roleCredentialCache?.setRoleCredential(did, claimType, eip191Jwt);
      }
    });
    return eip191Jwts.find(
      (jwt) =>
        jwt?.payload?.claimData.claimType === namespace ||
        utils.namehash(jwt?.payload?.claimData.claimType) === namespace
    );
  }

  /**
   * Fetches all the Role eip191Jwts belonging to the subject DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DID Documents
   * @returns RoleEIP191JWT list
   */
  async eip191JwtsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<RoleEIP191JWT[]> {
    if (this._cacheServerClient?.isAvailable) {
      const services = await this._cacheServerClient.getRoleCredentials(did);
      Logger.info(`DID Document for DID: ${did} resolved from SSI-Hub`);
      return (
        await Promise.all(
          services.map(async ({ serviceEndpoint }) => {
            if (!isCID(serviceEndpoint)) {
              return {};
            }
            const claimToken = await this._ipfsStore.get(serviceEndpoint);
            let rolePayload: RolePayload | undefined;
            // expect that JWT has 3 dot-separated parts
            if (claimToken.split('.').length === 3) {
              rolePayload = decode(claimToken) as RolePayload;
            }
            return {
              payload: rolePayload,
              eip191Jwt: claimToken,
            } as RoleEIP191JWT;
          })
        )
      )
        .filter(isEIP191Jwt)
        .map(transformClaim)
        .filter(filterOutMaliciousClaims);
    }
    return await this._ipfsCredentialResolver.eip191JwtsOf(
      did,
      didDocumentCache
    );
  }

  /**
   * Fetches all the Verifiable Credential belonging to the subject DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DID Documents.
   * @returns VerifiableCredential<RoleCredentialSubject> list
   */
  async credentialsOf(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<VerifiableCredential<RoleCredentialSubject>[]> {
    if (this._cacheServerClient?.isAvailable) {
      const services = await this._cacheServerClient.getRoleCredentials(did);
      Logger.info(`DID Document for DID: ${did} resolved from SSI-Hub`);
      return (
        await Promise.all(
          services.map(async ({ serviceEndpoint }) => {
            if (!isCID(serviceEndpoint)) {
              return {};
            }
            const credential = await this._ipfsStore.get(serviceEndpoint);
            let vc;
            // expect that JWT would have 3 dot-separated parts, VC is non-JWT credential
            if (!(credential.split('.').length === 3)) {
              vc = JSON.parse(credential);
            }
            return vc as VerifiableCredential<RoleCredentialSubject>;
          })
        )
      ).filter(isVerifiableCredential);
    }
    return await this._ipfsCredentialResolver.credentialsOf(
      did,
      didDocumentCache
    );
  }

  /**
   * Fetches DID Document for the given DID
   * @param did subject DID
   * @param didDocumentCache Cache to store DIDDocument. Cache is updated with Document retrieved for the DID
   * @returns
   */
  async getDIDDocument(
    did: string,
    didDocumentCache?: IDIDDocumentCache
  ): Promise<IDIDDocument> {
    let resolvedDIDDocument: IDIDDocument;
    const cachedDIDDocument = didDocumentCache?.getDIDDocument(did);
    if (cachedDIDDocument) {
      return cachedDIDDocument;
    }
    if (this._cacheServerClient?.isAvailable) {
      resolvedDIDDocument = await this._cacheServerClient.getDidDocument(did);
    } else {
      resolvedDIDDocument = await this._ipfsCredentialResolver.getDIDDocument(
        did,
        didDocumentCache
      );
    }
    didDocumentCache?.setDIDDocument(did, resolvedDIDDocument);
    return resolvedDIDDocument;
  }
}
