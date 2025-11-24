import { Controller, Get, Post, Delete, Body, Param, UseGuards, Inject, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WahaService } from './waha.service';

@Controller('waha')
@UseGuards(JwtAuthGuard)
export class WahaController {
  constructor(@Inject(WahaService) wahaService) {
    this.wahaService = wahaService;
  }

  @Get('sessions')
  async getSessions() {
    return this.wahaService.getSessions();
  }

  @Post('sessions')
  async createSession(@Body() body) {
    // For WAHA free, we always use a single default session
    const sessionName = body.sessionName || body.name || 'default';
    return this.wahaService.createSession(sessionName);
  }

  @Get('sessions/:name/qr')
  async getQR(@Param('name') name) {
    return this.wahaService.getSessionQR(name);
  }

  @Get('sessions/:name/status')
  async getStatus(@Param('name') name) {
    return this.wahaService.getSessionStatus(name);
  }

  @Delete('sessions/:name')
  async deleteSession(@Param('name') name) {
    return this.wahaService.deleteSession(name);
  }

  @Post('sessions/:name/logout')
  async logout(@Param('name') name) {
    return this.wahaService.logoutSession(name);
  }
}
