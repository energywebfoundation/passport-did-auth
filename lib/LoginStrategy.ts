import { BaseStrategy, StrategyOptions } from './BaseStrategy'
import { Request } from 'express'
import * as jwt from 'jsonwebtoken'
import { providers } from 'ethers'
import axios, { AxiosInstance } from 'axios'
import {
  ethrReg,
  Resolver,
  VoltaAddress1056,
} from '@ew-did-registry/did-ethr-resolver'

import { lookup, namehash, verifyClaim } from './utils'
import {
  Claim,
  DecodedToken,
  IRole,
  IRoleDefinition,
  ITokenPayload,
} from './LoginStrategy.types'
import { PublicResolverFactory } from '../ethers/PublicResolverFactory'
import { PublicResolver } from '../ethers/PublicResolver'
import { Methods } from '@ew-did-registry/did'
import { DidStore } from '@ew-did-registry/did-ipfs-store'

const { abi: abi1056 } = ethrReg

interface LoginStrategyOptions extends StrategyOptions {
  jwtSecret: string
  claimField?: string
  rpcUrl: string
  cacheServerUrl?: string
  numberOfBlocksBack?: number
  ensResolverAddress?: string
  didContractAddress?: string
  ipfsUrl?: string
}

export class LoginStrategy extends BaseStrategy {
  private claimField: string
  private jwtSecret: string
  private provider: providers.JsonRpcProvider
  private httpClient: AxiosInstance | undefined
  private numberOfBlocksBack: number
  private ensResolver: PublicResolver
  private didResolver: Resolver
  private ipfsStore: DidStore
  constructor(
    {
      claimField = 'claim',
      rpcUrl,
      cacheServerUrl,
      numberOfBlocksBack = 4,
      jwtSecret,
      ensResolverAddress = '0x0a97e07c4Df22e2e31872F20C5BE191D5EFc4680',
      didContractAddress = VoltaAddress1056,
      ipfsUrl = 'https://ipfs.infura.io:5001/api/v0/',
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
    if (cacheServerUrl) {
      this.httpClient = axios.create({
        baseURL: cacheServerUrl,
      })
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
    const did = verifyClaim(token, payload)

    if (!did) {
      console.log('Not Verified')
      return done(null, null, 'Not Verified')
    }
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
      const roleClaims = await this.getUserClaims(did)
      const roles = await Promise.all(
        roleClaims.map(async (claim) => {
          if (claim.iss) {
            return this.verifyRole({
              issuer: claim.iss,
              namespace: claim.claimType,
            })
          }
          const issuedClaim = this.decodeToken<DecodedToken>(claim.issuedToken)
          return this.verifyRole({
            issuer: issuedClaim.iss,
            namespace: claim.claimType,
          })
        })
      )

      const filteredRoles = roles.filter(Boolean)
      const user = {
        did: payload.iss,
        verifiedRoles: filteredRoles,
      }

      const jwtToken = this.encodeToken(user)
      return done(null, jwtToken)
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
  encodeToken(data: any, options?: jwt.SignOptions) {
    return jwt.sign(data, this.jwtSecret, options)
  }

  /**
   * @description extracts encoded payload either from request body or query
   *
   * @param req
   *
   * @returns {string} encoded claim
   */
  extractToken(req: Request) {
    return (
      lookup(req.body, this.claimField) || lookup(req.query, this.claimField)
    )
  }

  /**
   * @description checks that role which corresponds to `namespace` is owned by the `issuer`
   * @param param0
   */
  async verifyRole({
    namespace,
    issuer,
  }: {
    namespace: string
    issuer: string
  }) {
    const role = await this.getRoleDefinition(namespace)
    if (!role) {
      return null
    }

    if (role.issuer?.issuerType === 'DID') {
      if (
        Array.isArray(role.issuer?.did) &&
        role.issuer?.did.includes(issuer)
      ) {
        return {
          name: role.roleName,
          namespace,
        }
      }
      return null
    }

    if (role.issuer?.issuerType === 'Role') {
      const issuerClaims = await this.getUserClaims(issuer)
      const issuerRoles = issuerClaims.map(c => c.claimType)
      if (issuerRoles.includes(role.issuer.roleName)) {
        return {
          name: role.roleName,
          namespace,
        }
      }
    }
    return null
  }

  async getRoleDefinition(namespace: string) {
    if (this.httpClient) {
      const { data } = await this.httpClient.get<IRole>(`/role/${namespace}`)
      return data.definition
    }
    const namespaceHash = namehash(namespace)
    const definition = await this.ensResolver.text(namespaceHash, 'metadata')
    if (definition) {
      return JSON.parse(definition) as IRoleDefinition
    }
  }

  async getUserClaims(did: string) {
    if (this.httpClient) {
      const { data } = await this.httpClient.get<{ claim: Claim[] }>(
        `/claim/requester/${did}?accepted=true`
      )
      return data.claim
    }
    const didDocument = await this.didResolver.read(did)
    const services = didDocument.service || []
    const claims: Claim[] = await Promise.all(
      services.map(async ({ serviceEndpoint }) => {
        const claimToken = await this.ipfsStore.get(serviceEndpoint)
        const { claimData, iss } = this.decodeToken<{
          claimData: { claimType?: string }
          iss: string
        }>(claimToken)
        return {
          iss,
          claimType: claimData?.claimType,
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

  async getDidsWithAcceptedRole(role: string) {
    const { data } = await this.httpClient.get<string[]>(
      `/claim/did/${role}?accepted=true`
    )
    return data
  }
}
