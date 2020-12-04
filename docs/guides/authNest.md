# Authentication in NestJs application

1. Extend passport strategy [LoginStrategy](../api/classes/loginstrategy.md) wrapped by NestJs `PassportStrategy`:

``` typescript
import { LoginStrategy } from 'passport-did-auth';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AuthStrategy extends PassportStrategy(LoginStrategy, 'login') {
  constructor() {
    super({
      jwtSecret: 'secret',
      name: 'login',
      rpcUrl: 'https://volta-rpc-vkn5r5zx4ke71f9hcu0c.energyweb.org/', // for testing
      cacheServerUrl: 'http://13.52.78.249:3333/',
    });
  }
}
```

2. Create AuthGuard which uses this strategy

``` typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginGuard extends AuthGuard('login') {}
```

3. Protect login route with this guard and log in user on successful authentication 

``` typescript
 @UseGuards(LoginGuard)
  @Post('auth/login')
  async login(@Request() req) {
    /**
     * On successful authentication request will have user field to use as jwt
     * token in requests to routes protected with JwtGuard
     * /
    return { token: req.user };
  }
```
