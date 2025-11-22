import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  async register(body) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(req) {
    return this.authService.login(req.user);
  }
}
