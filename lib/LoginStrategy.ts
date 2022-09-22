import { BaseStrategy, StrategyOptions } from './BaseStrategy';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import {
  ethrReg,
  Resolver,
  addressOf,
} from '@ew-did-registry/did-ethr-resolver';

import { lookup, namehash } from './utils';
import { ITokenPayload } from './LoginStrategy.types';
import { Methods, getDIDChain, isValidErc1056 } from '@ew-did-registry/did';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { CacheServerClient } from './cacheServerClient';
import { ClaimVerifier } from './ClaimVerifier';
import { IDIDDocument } from '@ew-did-registry/did-resolver-interface';
import { ProofVerifier } from '@ew-did-registry/claims';
import { Logger } from './Logger';
import {
  DomainReader,
  ResolverContractType,
  IRoleDefinitionV2,
} from '@energyweb/credential-governance';
import { knownResolvers } from './defaultConfig';
import {
  CredentialResolver,
  IssuerResolver,
  IssuerVerification,
  RevocationVerification,
  RevokerResolver,
  VerificationResult,
} from '@energyweb/vc-verification';
import { StatusListEntryVerification } from '@ew-did-registry/revocation';

const { JsonRpcProvider } = providers;
const { abi: abi1056 } = ethrReg;

export interface LoginStrategyOptions extends StrategyOptions {
  claimField?: string;
  rpcUrl: string;
  cacheServerUrl?: string;
  privateKey?: string;
  numberOfBlocksBack?: number;
  ensResolvers?: {
    chainId: number;
    resolverType: ResolverContractType;
    address: string;
  }[];
  didContractAddress: string;
  ensRegistryAddress: string;
  ipfsUrl?: string;
  acceptedRoles?: string[];
  jwtSecret: string | Buffer;
  jwtSignOptions?: jwt.SignOptions;
}

export class LoginStrategy extends BaseStrategy {
  private readonly claimField: string;
  private readonly jwtSecret: string | Buffer;
  private readonly jwtSignOptions?: jwt.SignOptions;
  private readonly provider: providers.JsonRpcProvider;
  private readonly numberOfBlocksBack: number;
  private readonly domainReader: DomainReader;
  private readonly didResolver: Resolver;
  private readonly ipfsStore: DidStore;
  private readonly acceptedRoles: Set<string>;
  private readonly cacheServerClient?: CacheServerClient;
  private readonly issuerVerification: IssuerVerification;
  private readonly revocationVerification: RevocationVerification;
  private readonly statuslListEntryVerification: StatusListEntryVerification;

  constructor(
    {
      claimField = 'identityToken',
      rpcUrl,
      cacheServerUrl,
      privateKey,
      numberOfBlocksBack = 4,
      jwtSecret,
      jwtSignOptions,
      ensResolvers = [],
      didContractAddress,
      ensRegistryAddress,
      ipfsUrl = 'https://ipfs.infura.io:5001/api/v0/',
      acceptedRoles,
      ...options
    }: LoginStrategyOptions,
    issuerResolver: IssuerResolver,
    revokerResolver: RevokerResolver,
    private credentialResolver: CredentialResolver,
    verifyProof: (
      vc: string,
      proof_options: string
    ) => Promise<VerificationResult>,

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    _nestJsCB?: VoidFunction // Added just for nestjs compatibility
  ) {
    super(options);
    this.claimField = claimField;
    this.provider = new JsonRpcProvider(rpcUrl);
    this.domainReader = new DomainReader({
      ensRegistryAddress,
      provider: this.provider,
    });

    knownResolvers
      .concat(ensResolvers)
      .forEach(({ chainId, resolverType, address }) =>
        this.domainReader.addKnownResolver({
          chainId,
          address,
          type: resolverType,
        })
      );
    if (cacheServerUrl && !privateKey) {
      throw new Error(
        'You need to provide privateKey of an accepted account to login to cache server'
      );
    }
    if (cacheServerUrl && privateKey) {
      this.cacheServerClient = new CacheServerClient({
        privateKey,
        provider: this.provider,
        url: cacheServerUrl,
      });
      this.cacheServerClient.login();
    }
    const registrySetting = {
      abi: abi1056,
      address: didContractAddress,
      method: Methods.Erc1056,
    };
    this.didResolver = new Resolver(this.provider, registrySetting);
    this.ipfsStore = new DidStore(ipfsUrl);
    this.numberOfBlocksBack = numberOfBlocksBack;
    this.jwtSecret = jwtSecret;
    this.acceptedRoles = new Set(acceptedRoles);
    this.jwtSignOptions = jwtSignOptions;
    this.revocationVerification = new RevocationVerification(
      revokerResolver,
      issuerResolver,
      credentialResolver,
      this.provider,
      registrySetting,
      verifyProof
    );
    this.issuerVerification = new IssuerVerification(
      issuerResolver,
      credentialResolver,
      this.provider,
      registrySetting,
      this.revocationVerification,
      verifyProof
    );
    this.statuslListEntryVerification = new StatusListEntryVerification(
      verifyProof
    );
  }

  private async getDidDocument(did: string): Promise<IDIDDocument> {
    const _didDocument = this.cacheServerClient?.isAvailable
      ? await this.cacheServerClient.getDidDocument(did)
      : await this.didResolver.read(did);

    return _didDocument;
  }

  /**
   * @description Uses authentication token to
   * * Authenticate user
   * * Check that token is not expired
   * * User has enrolled with at least one role
   *
   * ```typescript
   * const loginStrategy = new LoginStrategy(
   * loginStrategyOptions,
   * issuerResolver,
   * revokerResolver,
   * credentialResolver,
   * verifyCredential
   * );
   *
   * passport.use(loginStrategy);
   * passport.use(
   *   new Strategy(jwtOptions, (_payload, _done) => {
   *     return _done(null, _payload);
   *   })
   * );
   *
   * const token = 'askjad...';
   * const payload = {
   *   iss: `did:ethr:volta:0x1224....`,
   *   claimData: {
   *     blockNumber: 4242,
   *   },
   *   sub: '',
   * };
   *
   * await loginStrategy.validate(token, payload);
   * ```
   *
   * @param token
   * @param payload
   * @callback done on successful validation is called with encoded {did, verifiedRoles} object
   */
  async validate(
    token: string,
    payload: ITokenPayload,
    done: (err?: Error, user?: unknown, info?: unknown) => void
  ): Promise<void> {
    if (!this.isTokenPayload(payload)) {
      Logger.info('Token payload is not valid');
      return done(undefined, null, 'Token payload is not valid');
    }

    const iss = this.didUnification(payload.iss);

    let userDoc: IDIDDocument;

    try {
      userDoc = await this.getDidDocument(iss);
    } catch (err) {
      const error: Error = err as Error;
      Logger.error(`error getting DID document: ${error}`);
      return done(error);
    }

    const proofVerifier = new ProofVerifier(userDoc);
    const userDid = await proofVerifier.verifyAuthenticationProof(token);

    if (!userDid) {
      Logger.info('Not Verified');
      return done(undefined, null, 'Not Verified');
    }

    const userAddress = addressOf(userDid);

    try {
      // TODO: remove parseInt (it's only for backward compatibility)
      const claimBlockNumber =
        typeof payload.claimData.blockNumber === 'number'
          ? payload.claimData.blockNumber
          : parseInt(payload.claimData.blockNumber);
      const latestBlock = await this.provider.getBlockNumber();
      if (latestBlock - this.numberOfBlocksBack >= claimBlockNumber) {
        Logger.info('Claim outdated');
        return done(undefined, null, 'Claim outdated');
      }
    } catch (err) {
      const error: Error = err as Error;
      Logger.error(`Provider err: ${error}`);
      return done(error);
    }

    try {
      /*
       * getUserClaims attempts to retrieve claims from cache-server
       * and so when the cache-server itself is using the LoginStrategy,
       * this creates a login attempt loop.
       * Therefore, not getting userClaims
       * if address attempting to login is the address of the strategy
       */
      const userClaims =
        this.cacheServerClient?.address === userAddress
          ? []
          : await this.credentialResolver.eip191JwtsOf(userDid);
      const verifier = new ClaimVerifier(
        userClaims,
        this.getRoleDefinition.bind(this),
        this.issuerVerification,
        this.revocationVerification,
        this.statuslListEntryVerification
      );
      const uniqueRoles = await verifier.getVerifiedRoles();

      if (uniqueRoles.length === 0) {
        return done(undefined, null, 'User does not have any roles.');
      } else if (
        this.acceptedRoles &&
        this.acceptedRoles.size > 0 &&
        !uniqueRoles.some(({ namespace }) => {
          return this.acceptedRoles.has(namespace);
        })
      ) {
        return done(undefined, null, 'User does not have an accepted role.');
      }
      const user = {
        did: iss,
        verifiedRoles: uniqueRoles,
      };
      if (this.jwtSecret) {
        const jwtToken = this.encodeToken(user);
        return done(undefined, jwtToken);
      }
      return done(undefined, user);
    } catch (err) {
      const error: Error = err as Error;
      Logger.error(error);
      return done(error);
    }
  }

  decodeToken<T>(token: string, options?: jwt.DecodeOptions): T {
    return jwt.decode(token, options) as T;
  }

  /**
   *
   * @param data payload to encode
   * @param options
   */
  encodeToken(data: Record<string, unknown>): string {
    return jwt.sign(data, this.jwtSecret, this.jwtSignOptions);
  }

  /**
   * extracts encoded payload either from request body or query
   * @param req
   * @returns {string} encoded claim
   */
  extractToken(req: Request): string | null {
    if (req.body.identity)
      return (
        lookup(req.body.identity, this.claimField) ||
        lookup(req.query, this.claimField)
      );
    return (
      lookup(req.body, this.claimField) || lookup(req.query, this.claimField)
    );
  }

  async getRoleDefinition(
    namespace: string
  ): Promise<IRoleDefinitionV2 | null> {
    if (this.cacheServerClient?.isAvailable) {
      return this.cacheServerClient.getRoleDefinition({ namespace });
    }

    const definition = await this.domainReader.read({
      node: namehash(namespace),
    });
    return DomainReader.isRoleDefinitionV2(definition) ? definition : null;
  }

  async verifyIssuer(issuer: string, role: string) {
    return this.issuerVerification.verifyIssuer(issuer, role);
  }

  /**
   * @param {string} did
   * @returns {string} DID address in format "did:" method-name ":" method-specific-id ":" address
   */
  didUnification(did: string): string {
    const { foundChainInfo } = getDIDChain(did);
    if (foundChainInfo) return did;

    const didParts = did.split(':');

    let chainName = 'volta';
    if (
      this.cacheServerClient?.isAvailable &&
      this.cacheServerClient?.chainName
    ) {
      chainName = this.cacheServerClient?.chainName;
    }
    return `${didParts[0]}:${didParts[1]}:${chainName}:${didParts[2]}`;
  }

  isTokenPayload(payload: unknown): payload is ITokenPayload {
    if (!payload) return false;
    if (typeof payload !== 'object') return false;

    const payloadKeys = Object.keys(payload);
    if (!payloadKeys.includes('iss') || !payloadKeys.includes('claimData')) {
      return false;
    }

    if (typeof payload['claimData'] !== 'object') return false;

    const claimDatKeys = Object.keys(payload['claimData']);
    if (!claimDatKeys.includes('blockNumber')) {
      return false;
    }

    // TODO: remove `string` type (it's only for backward compatibility)
    const blockNumberType = typeof payload['claimData']['blockNumber'];
    if (!['string', 'number'].includes(blockNumberType)) {
      return false;
    }

    if (
      blockNumberType === 'string' &&
      isNaN(payload['claimData']['blockNumber'])
    ) {
      return false;
    }

    if (typeof payload['iss'] !== 'string' || !isValidErc1056(payload['iss'])) {
      return false;
    }

    return true;
  }
}
