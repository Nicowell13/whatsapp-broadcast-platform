import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) usersService,
    @Inject(JwtService) jwtService,
  ) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async validateUser(email, password) {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(userData) {
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(userData);
    const { password, ...result } = user;
    return this.login(result);
  }
}
