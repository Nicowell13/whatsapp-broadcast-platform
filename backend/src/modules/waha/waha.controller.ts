// waha.controller.ts FINAL
import { Controller, Get, Post, Delete } from '@nestjs/common';
import { WahaService } from './waha.service';

@Controller('waha')
export class WahaController {
  constructor(private readonly wahaService: WahaService) {}

  @Post('sessions')
  async createSession() {
    return this.wahaService.createSession();
  }

  @Post('sessions/start')
  async startSession() {
    return this.wahaService.startSession();
  }

  @Delete('sessions')
  async deleteSession() {
    return this.wahaService.deleteSession();
  }

  @Get('sessions/status')
  async getStatus() {
    return this.wahaService.getStatus();
  }

  @Get('sessions/qr')
  async getQR() {
    return this.wahaService.getQR();
  }
}
