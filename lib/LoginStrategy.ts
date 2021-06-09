import {
  lookup,
  namehash,
} from './utils'

import {
  Claim,
  ITokenPayload,
  IRoleDefinition
} from './LoginStrategy.types'

import {
  ethrReg,
  Resolver,
  VoltaAddress1056,
} from '@ew-did-registry/did-ethr-resolver'


import { Request } from 'express'
import { providers } from 'ethers'
import * as jwt from 'jsonwebtoken'
import { ClaimVerifier } from './ClaimVerifier'
import { Methods } from '@ew-did-registry/did'
import { CacheServerClient } from './cacheServerClient'
import { AuthTokenVerifier } from './AuthTokenVerifier'
import { PublicResolver } from '../ethers/PublicResolver'
import { DidStore } from '@ew-did-registry/did-ipfs-store'
import { BaseStrategy, StrategyOptions } from './BaseStrategy'
import { PublicResolverFactory } from '../ethers/PublicResolverFactory'

const { abi: abi1056 } = ethrReg

export interface LoginStrategyOptions extends StrategyOptions {

  rpcUrl: string
  ipfsUrl?: string
  privateKey?: string
  claimField?: string
  acceptedRoles?: string[]
  cacheServerUrl?: string
  jwtSecret: string | Buffer
  numberOfBlocksBack?: number
  ensResolverAddress?: string
  didContractAddress?: string
  jwtSignOptions?: jwt.SignOptions
}

export class LoginStrategy extends BaseStrategy {

  private readonly privateKey: string
  private readonly claimField: string
  private readonly ipfsStore: DidStore
  private readonly didResolver: Resolver
  private readonly strategyAddress?: string
  private readonly acceptedRoles: Set<string>
  private readonly numberOfBlocksBack: number
  private readonly jwtSecret?: string | Buffer
  private readonly ensResolver: PublicResolver
  private readonly jwtSignOptions?: jwt.SignOptions
  private readonly provider: providers.JsonRpcProvider
  private readonly cacheServerClient: CacheServerClient

  constructor(
    {
      claimField = 'identityToken',
      rpcUrl,
      cacheServerUrl,
      privateKey,
      numberOfBlocksBack = 4,
      jwtSecret,
      jwtSignOptions,
      ensResolverAddress = '0x0a97e07c4Df22e2e31872F20C5BE191D5EFc4680',
      didContractAddress = VoltaAddress1056,
      ipfsUrl = 'https://ipfs.infura.io:5001/api/v0/',
      acceptedRoles,
      ...options
    }: LoginStrategyOptions,
    _nestJsCB?: VoidFunction // Added just for nestjs compatibility
  ) {
    super(options)
    this.claimField = claimField
    this.provider = new providers.JsonRpcProvider(rpcUrl)
    this.ensResolver = PublicResolverFactory.connect(
      ensResolverAddress,
      this.provider
    )
    if (cacheServerUrl && !privateKey) {
      throw new Error(
        'You need to provide privateKey of an accepted account to login to cache server'
      )
    }
    if (cacheServerUrl && privateKey) {
      this.cacheServerClient = new CacheServerClient({
        privateKey,
        provider: this.provider,
        url: cacheServerUrl,
      })
      this.strategyAddress = this.cacheServerClient.address
      this.cacheServerClient.login()
    }
    const registrySetting = {
      abi: abi1056,
      address: didContractAddress,
      method: Methods.Erc1056,
    }
    this.didResolver = new Resolver(this.provider, registrySetting)
    this.ipfsStore = new DidStore(ipfsUrl)
    this.numberOfBlocksBack = numberOfBlocksBack
    this.jwtSecret = jwtSecret
    this.acceptedRoles = acceptedRoles && new Set(acceptedRoles)
    this.jwtSignOptions = jwtSignOptions
    this.privateKey = privateKey
  }
  
  /**
   * @description verifies issuer signature, then check that claim issued
   * no latter then `this.numberOfBlocksBack` and user has enrolled with at
   * least one role
   * @param token
   * @param payload
   * @callback done on successful validation is called with encoded {did, verifiedRoles} object
   */
  async validate(
    token: string,
    payload: ITokenPayload,
    done: (err?: Error, user?: any, info?: any) => void
  ) {
    const didDocument = await this.cacheServerClient?.getDidDocument(payload.iss) ?? await this.didResolver.read(payload.iss)
    const authenticationClaimVerifier = new AuthTokenVerifier(this.privateKey, didDocument)
    const did = await authenticationClaimVerifier.verify(token, payload.iss)

    if (!did) {
      console.log('Not Verified')
      return done(null, null, 'Not Verified')
    }

    const [, , address] = did.split(':')

    try {
      const latestBlock = await this.provider.getBlockNumber()
      if (
        !payload.claimData.blockNumber ||
        latestBlock - this.numberOfBlocksBack >= payload.claimData.blockNumber
      ) {
        console.log('Claim outdated')
        return done(null, null, 'Claim outdated')
      }
    } catch (err) {
      console.log('Provider err', err)
      return done(err)
    }

    try {
      const roleClaims =
        /*
         * getUserClaims attempts to retrieve claims from cache-server
         * and so when the cache-server itself is using the LoginStrategy,
         * this creates a login attempt loop.
         * Therefore, not getting userClaims
         * if address attempting to login is the address of the strategy
         */
        this.strategyAddress === address ? [] : await this.getUserClaims(did)
      const verifier = new ClaimVerifier(roleClaims, this.getRoleDefinition.bind(this), this.getUserClaims.bind(this))
      const uniqueRoles = await verifier.getVerifiedRoles();

      if (
        this.acceptedRoles &&
        this.acceptedRoles.size > 0 &&
        uniqueRoles.length > 0 &&
        !uniqueRoles.some(({ namespace }) => {
          return this.acceptedRoles.has(namespace)
        })
      ) {
        return done(null, null, 'User does not have an accepted role.')
      }
      const user = {
        did: payload.iss,
        verifiedRoles: uniqueRoles,
      }
      if (this.jwtSecret) {
        const jwtToken = this.encodeToken(user)
        return done(null, jwtToken)
      }
      return done(null, user)
    } catch (err) {
      console.log(err)
      return done(err)
    }
  }

  decodeToken<T>(token: string, options?: jwt.DecodeOptions): T {
    return jwt.decode(token, options) as T
  }

  /**
   *
   * @param data payload to encode
   * @param options
   */
  encodeToken(data: any) {
    return jwt.sign(data, this.jwtSecret, this.jwtSignOptions)
  }

  /**
   * @description extracts encoded payload either from request body or query
   *
   * @param req
   *
   * @returns {string} encoded claim
   */
  extractToken(req: Request): string {
    return (
      lookup(req.body, this.claimField) || lookup(req.query, this.claimField)
    )
  }

  async getRoleDefinition(namespace: string) {
    if (this.cacheServerClient) {
      return this.cacheServerClient.getRoleDefinition({ namespace })
    }
    const namespaceHash = namehash(namespace)
    const definition = await this.ensResolver.text(namespaceHash, 'metadata')
    if (definition) {
      return JSON.parse(definition) as IRoleDefinition
    }
  }

  async getUserClaims(did: string) {
    if (this.cacheServerClient) {
      return this.cacheServerClient.getUserClaims({ did })
    }
    const didDocument = await this.didResolver.read(did)
    const services = didDocument.service || []
    const claims: Claim[] = await Promise.all(
      services.map(async ({ serviceEndpoint }) => {
        const claimToken = await this.ipfsStore.get(serviceEndpoint)
        const { claimData, iss } = this.decodeToken<{
          claimData: { claimType?: string; claimTypeVersion?: string }
          iss: string
        }>(claimToken)
        return {
          iss,
          claimType: claimData?.claimType,
          claimTypeVersion: claimData?.claimTypeVersion,
        }
      })
    )
    return claims.reduce((acc, item) => {
      if (item.claimType) {
        acc.push(item)
      }
      return acc
    }, [] as Claim[])
  }
}