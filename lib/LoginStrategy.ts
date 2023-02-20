import { BaseStrategy, StrategyOptions } from './BaseStrategy';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { providers } from 'ethers';
import { ethrReg, addressOf } from '@ew-did-registry/did-ethr-resolver';
import { lookup, namehash } from './utils';
import {
  AuthorisedUser,
  ITokenPayload,
  RoleCredentialStatus,
  RoleStatus,
} from './LoginStrategy.types';
import { Methods, getDIDChain, isValidErc1056 } from '@ew-did-registry/did';
import { CacheServerClient } from './cacheServerClient';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
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
import { SiweMessage, SiweResponse } from 'siwe';
import type { SiweMessage as SiweMessagePayload } from 'siwe';
import { hasIn } from 'lodash';

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
  includeAllRoles?: boolean;
  jwtSecret?: string | Buffer;
  jwtSignOptions?: jwt.SignOptions;
}

export class LoginStrategy extends BaseStrategy {
  private readonly claimField: string;
  private readonly jwtSecret?: string | Buffer;
  private readonly jwtSignOptions?: jwt.SignOptions;
  private readonly provider: providers.JsonRpcProvider;
  private readonly numberOfBlocksBack: number;
  private readonly domainReader: DomainReader;
  private readonly ipfsStore: DidStore;
  private readonly acceptedRoles: Set<string>;
  private readonly includeAllRoles: boolean = false;
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
      includeAllRoles,
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
    this.numberOfBlocksBack = numberOfBlocksBack;
    this.jwtSecret = jwtSecret;
    this.acceptedRoles = new Set(acceptedRoles);
    if (includeAllRoles) {
      this.includeAllRoles = includeAllRoles;
    }
    this.jwtSignOptions = jwtSignOptions;
    this.ipfsStore = new DidStore(ipfsUrl);
    this.revocationVerification = new RevocationVerification(
      revokerResolver,
      issuerResolver,
      credentialResolver,
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
    return this.credentialResolver.getDIDDocument(did);
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
    payload: ITokenPayload | Partial<SiweMessagePayload>,
    done: (err?: Error, user?: unknown, info?: unknown) => void
  ): Promise<void> {
    if (this.isEIP191TokenPayload(payload)) {
      return this.verifyEIP191Token(token, payload, done);
    }
    if (this.isSiweMessagePayload(payload)) {
      return this.verifySiweToken(token, payload, done);
    } else {
      Logger.info('Token payload is not valid');
      return done(undefined, null, 'Token payload is not valid');
    }
  }

  /**
   * Verifies EIP191 Token and payload
   * @param token signature
   * @param payload EIP191 payload
   * @param done
   * @returns
   */
  private async verifyEIP191Token(
    token: string,
    payload: ITokenPayload,
    done: (err?: Error, user?: unknown, info?: unknown) => void
  ): Promise<void> {
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
      Logger.info('Not Verified: Authentication proof is not valid');
      return done(
        undefined,
        null,
        'Not Verified: Authentication proof is not valid'
      );
    }

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

    return await this.getVerifiedAcceptedRoles(userDid, done);
  }

  /**
   * Verifies Siwe Message and signature
   * @param token signature
   * @param payload Siwe payload
   * @param done
   * @returns
   */
  private async verifySiweToken(
    token: string,
    payload: Partial<SiweMessagePayload>,
    done: (err?: Error, user?: unknown, info?: unknown) => void
  ): Promise<void> {
    const userDid = this.didUnification(`did:ethr:${payload.address}`);
    const siwe = new SiweMessage(payload);
    try {
      await siwe.verify({
        signature: token,
        domain: payload.domain,
        nonce: payload.nonce,
        time: payload.issuedAt,
      });
    } catch (error) {
      const err = error as SiweResponse;
      const errorMessage = err.error?.type;
      return done(new Error(errorMessage));
    }
    return this.getVerifiedAcceptedRoles(userDid, done);
  }

  /**
   * Fetches verified roles based on the userDID and configured accepted roles
   * @param userDid user DID
   * @param done
   * @returns
   */
  private async getVerifiedAcceptedRoles(
    userDid: string,
    done: (err?: Error, user?: unknown, info?: unknown) => void
  ): Promise<void> {
    const userAddress = addressOf(userDid);
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

      const claimsToVerify = this.includeAllRoles
        ? userClaims
        : userClaims.filter((claim) => {
            const claimType = claim?.payload?.claimData?.claimType;
            return claimType && this.acceptedRoles.has(claimType);
          });

      if (this.includeAllRoles && claimsToVerify.length === userClaims.length) {
        Logger.info('includeAllRoles: true, verifying all roles');
      } else {
        Logger.info('includeAllRoles: false, verifying only accepted roles');
      }
      const verifier = new ClaimVerifier(
        claimsToVerify,
        this.getRoleDefinition.bind(this),
        this.issuerVerification,
        this.revocationVerification,
        this.statuslListEntryVerification
      );
      const uniqueRoles = await verifier.getVerifiedRoles();

      if (uniqueRoles.length === 0 && this.acceptedRoles.size > 0) {
        return done(undefined, null, 'User does not have any roles.');
      }
      let user: AuthorisedUser;
      if (!this.includeAllRoles && this.acceptedRoles.size > 0) {
        const { userRoles, authorisationStatus } =
          this.validateAcceptedRoles(uniqueRoles);

        user = {
          did: userDid,
          userRoles: userRoles,
          authorisationStatus: authorisationStatus,
        };
      } else {
        user = {
          did: userDid,
          userRoles: uniqueRoles,
          authorisationStatus: true,
        };
      }
      if (!user.authorisationStatus) {
        return done(
          undefined,
          user,
          'User either does not have accpeted role credentials or are invalid.'
        );
      }
      if (this.jwtSecret) {
        return done(
          undefined,
          jwt.sign(user, this.jwtSecret, this.jwtSignOptions)
        );
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

  isEIP191TokenPayload(payload: unknown): payload is ITokenPayload {
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

  isSiweMessagePayload(payload: unknown): payload is Partial<SiweMessagePayload> {
    if (!payload) return false;
    if (typeof payload !== 'object') return false;
    if (
      !hasIn(payload, 'domain') ||
      !hasIn(payload, 'nonce') ||
      !hasIn(payload, 'uri') ||
      !hasIn(payload, 'address')
    ) {
      return false;
    }
    if (
      typeof payload['domain'] !== 'string' ||
      typeof payload['nonce'] !== 'string' ||
      typeof payload['uri'] !== 'string'
    ) {
      return false;
    }
    return true;
  }

  /**
   * Validates if user's role credential is valid or not and sets authorisation status
   * @param userRoles verified user role credential
   * @returns
   */
  private validateAcceptedRoles(userRoles: RoleStatus[]): {
    userRoles: RoleStatus[];
    authorisationStatus: boolean;
  } {
    let authorisationStatus = false;
    this.acceptedRoles.forEach((role) => {
      const userRole = userRoles.find(
        (roleStatus) => roleStatus.namespace == role
      );
      if (userRole && userRole.status === RoleCredentialStatus.VALID) {
        authorisationStatus = true;
      }
    });
    return {
      userRoles,
      authorisationStatus,
    };
  }
}
