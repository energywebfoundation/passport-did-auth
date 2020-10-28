import { Module } from '@nestjs/common';
import { AuthStrategy } from './auth.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  providers: [AuthStrategy, JwtStrategy],
})
export class AuthModule {}
