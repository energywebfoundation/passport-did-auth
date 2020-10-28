import { LoginStrategy } from '../../../../../dist';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
  constructor() {
    super({
      jwtSecret: 'secret',
      name: 'login',
      rpcUrl: 'https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org/',
      cacheServerUrl: 'http://13.52.78.249:3333/',
    });
  }
}
