import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WahaService } from './waha.service';

@Controller('waha')
@UseGuards(JwtAuthGuard)
export class WahaController {
  constructor(private readonly wahaService: WahaService) {}

  // ============================================================
  // DEFAULT SESSION ONLY
  // ============================================================

  @Post('session/start')
  async startDefault() {
    await this.wahaService.createDefaultSession();
    return this.wahaService.startDefaultSession();
  }

  @Get('session/status')
  async getStatus() {
    return this.wahaService.getDefaultStatus();
  }

  @Get('session/qr')
  async getQR() {
    return this.wahaService.getDefaultQR();
  }

  @Delete('session')
  async deleteDefault() {
    return this.wahaService.deleteDefaultSession();
  }
}
