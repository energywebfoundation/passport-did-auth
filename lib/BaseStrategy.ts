import { AuthenticateOptions, Strategy } from 'passport'
import { Request } from 'express'
import { inherits } from 'util'
import { Claim } from './LoginStrategy.types'

export interface StrategyOptions {
  name: string
}

/**
 * @abstract
 * @description passport strategy used to authenticate decetralized identity.
 * Subclasses should define their token extraction and validation logic
 */
export abstract class BaseStrategy extends Strategy {
  /**
   * @abstract
   * @description contains token validation logic
   * @param token  serialized claims
   * @param tokenPayload claim payload
   * @param done
   */
  abstract validate(
    token: string,
    tokenPayload: any,
    done: (err?: Error, user?: any, info?: any) => any
  ): void
  /**
   * @abstract
   * @description extracts token from request
   *
   * @param req object than encapsules request to protected endpoint
   * @returns encoded token
   */
  abstract extractToken(req: Request): string | null
  /**
   * @abstract
   * @description decodes token payload
   *
   * @param token encoded payload
   * @returns decoded payload fields
   */
  abstract decodeToken(token: string): string | { [key: string]: any }
  /**
   * @abstract
   * @description fetches claims published by the did
   *
   * @param did
   */
  abstract getUserClaims(did: string): Promise<Claim[]>

  /**
   * @constructor
   */
  constructor({ name }: StrategyOptions) {
    super()
    this.name = name
  }

  /**
   * @description template method to authenticate DID
   *
   * @param req
   * @param options
   */
  authenticate(req: Request, options: AuthenticateOptions) {
    const self = this
    const token = this.extractToken(req)
    if (!token) {
      return self.fail('Missing credentials', 400)
    }
    const tokenPayload = this.decodeToken(token)
    function verified(err?: Error, user?: any, info?: any) {
      if (err) {
        return self.error(err)
      }
      if (!user) {
        return self.fail(info)
      }
      self.success(user, info)
    }
    this.validate(token, tokenPayload, verified)
  }
}

inherits(BaseStrategy, Strategy)
