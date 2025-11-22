import { Controller, Get, Delete, Param, UseGuards, Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) usersService) {
    this.usersService = usersService;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(id) {
    return this.usersService.deleteUser(id);
  }
}
