import { AuthenticateOptions, Strategy } from 'passport'
import { Request } from 'express'
import { inherits } from 'util'
import { Claim } from './LoginStrategy.types'

export interface StrategyOptions {
  name: string
}

export abstract class BaseStrategy extends Strategy {
  abstract validate(
    token: string,
    tokenPayload: any,
    done: (err?: Error, user?: any, info?: any) => any
  ): void
  abstract extractToken(req: Request): string
  abstract decodeToken(token: string): string | { [key: string]: any }
  abstract getUserClaims(did: string): Promise<Claim[]>

  constructor({ name }: StrategyOptions) {
    super()
    this.name = name
  }

  authenticate(req: Request, options: AuthenticateOptions) {
    const self = this
    const token = this.extractToken(req)
    if (!token) {
      return self.fail('Missing credentials', 400)
    }
    const tokenPayload = this.decodeToken(token)
    function verified(err: Error, user: any, info: any) {
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
