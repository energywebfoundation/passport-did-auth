/* eslint-disable @typescript-eslint/no-explicit-any */
import { Strategy } from 'passport';
import { Request } from 'express';
import { inherits } from 'util';
import { SiweReqPayload } from './LoginStrategy.types';

export interface StrategyOptions {
  name: string;
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
    tokenPayload: string | { [key: string]: any },
    done: (err?: Error, user?: any, info?: any) => any
  ): void;
  /**
   * @abstract
   * @description extracts token from request
   *
   * @param req object that encapsules request to protected endpoint
   * @returns encoded token
   */
  abstract extractToken(req: Request): string | null;
  /**
   * @abstract
   * @description extracts siwe signature and message from request
   *
   * @param req object that encapsules request to protected endpoint
   * @returns encoded siwe signature and message
   */
  abstract extractSiwe(req: Request): SiweReqPayload | null;
  /**
   * @abstract
   * @description decodes token payload
   *
   * @param token encoded payload
   * @returns decoded payload fields
   */
  abstract decodeToken(token: string): string | { [key: string]: any };

  /**
   * @constructor
   */
  constructor({ name }: StrategyOptions) {
    super();
    this.name = name;
  }

  /**
   * @description template method to authenticate DID
   *
   * @param req
   * @param options
   */
  authenticate(req: Request): void {
    const token = this.extractToken(req);
    const siweObject = this.extractSiwe(req);
    const verified = (err, user, info) => {
      if (err) {
        return this.error(err);
      }
      if (!user) {
        return this.fail(info);
      }
      this.success(user, info);
    };
    if (token) {
      const tokenPayload = this.decodeToken(token);
      this.validate(token, tokenPayload, verified);
    } else if (siweObject) {
      this.validate(siweObject.signature, siweObject.message, verified);
    } else {
      return this.fail('Missing credentials', 400);
    }
  }
}

inherits(BaseStrategy, Strategy);
