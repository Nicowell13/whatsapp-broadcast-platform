// waha.controller.ts - DEFAULT SESSION ONLY (FINAL)
import { Controller, Get, Post, Delete } from '@nestjs/common';
import { WahaService } from './waha.service';

@Controller('waha')
export class WahaController {
  constructor(private readonly wahaService: WahaService) {}

  @Post('sessions/default')
  async createDefault() {
    return this.wahaService.createDefaultSession();
  }

  @Post('sessions/default/start')
  async startDefault() {
    return this.wahaService.startDefaultSession();
  }

  @Delete('sessions/default')
  async deleteDefault() {
    return this.wahaService.deleteDefaultSession();
  }

  @Get('sessions/default/status')
  async getDefaultStatus() {
    return this.wahaService.getDefaultStatus();
  }

  @Post('sessions/default/logout')
  async logoutDefault() {
    return this.wahaService.logoutDefault();
  }

  @Get('sessions/default/qr')
  async getDefaultQR() {
    return this.wahaService.getDefaultQR();
  }
}
