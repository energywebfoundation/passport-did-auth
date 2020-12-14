import { LoginStrategy } from '../../../../../dist';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
  constructor() {
    super({
      jwtSecret: 'secret',
      name: 'login',
      rpcUrl: 'https://volta-rpc.energyweb.org/',
      cacheServerUrl: 'https://volta-iam-cacheserver.energyweb.org/',
    });
  }
}
