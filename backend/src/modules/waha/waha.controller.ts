import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WahaService } from './waha.service';

@Controller('waha')
export class WahaController {
  constructor(private readonly wahaService: WahaService) {}

@Get('sessions/:name/qr')
async getQR(@Param('name') name: string) {
  return this.wahaService.getQR(name);
}

@Get('sessions/:name/status')
async getStatus(@Param('name') name: string) {
  return this.wahaService.getStatus(name);
}


  @Get('health')
  async health() {
    return this.wahaService.checkHealth();
  }

  @Get('sessions')
  async sessions() {
    return this.wahaService.getSessions();
  }

  @Post('sessions')
  async createSession(@Body() body: { name: string; config?: Record<string, any> }) {
    const name = body?.name || 'default';
    const config = body?.config || {};
    return this.wahaService.createSession(name, config);
  }

  @Post('sessions/:name/start')
  async startSession(@Param('name') name: string) {
    return this.wahaService.startSession(name);
  }

  @Post('sessions/start-default')
  async startDefault() {
    return this.wahaService.startDefaultSession();
  }

  @Post('sessions/:name/logout')
  async logout(@Param('name') name: string) {
    return this.wahaService.logoutSession(name);
  }

  @Post('sessions/:name/delete')
  async delete(@Param('name') name: string) {
    return this.wahaService.deleteSession(name);
  }
}

