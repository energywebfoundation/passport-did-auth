import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginGuard } from './auth/auth.guard';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller()
export class AppController {
  constructor() {}

  @UseGuards(LoginGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return { token: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  getRoles(@Req() req: Request) {
    return (req.user as {
      verifiedRoles: { name: string; namespace: string }[];
      did: string;
    }).verifiedRoles;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser(@Req() req: Request) {
    return req.user;
  }
}
