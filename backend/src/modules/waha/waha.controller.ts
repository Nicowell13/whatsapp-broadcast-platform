import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WahaService } from './waha.service';

@Controller('waha')
@UseGuards(JwtAuthGuard)
export class WahaController {
  constructor(private readonly wahaService: WahaService) {}

  @Post('sessions')
  async createSession(@Body() body: any) {
    const name = body.name || 'default';
    return this.wahaService.createSession(name);
  }

  @Post('sessions/:name/start')
  async start(@Param('name') name: string) {
    return this.wahaService.startSession(name);
  }

  @Get('sessions/:name/status')
  async status(@Param('name') name: string) {
    return this.wahaService.getSessionStatus(name);
  }

  @Get('sessions/default/qr')
  async qr() {
    return this.wahaService.getSessionQR();
  }

  @Delete('sessions/:name')
  async delete(@Param('name') name: string) {
    return this.wahaService.deleteSession(name);
  }
}
