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

  @Get('sessions')
  async getSessions(): Promise<any> {
    return this.wahaService.getSessions();
  }

  @Post('sessions')
  async createSession(@Body() body: any): Promise<any> {
    const sessionName = body.sessionName || body.name || 'default';
    if (!sessionName) {
      throw new BadRequestException('sessionName is required');
    }
    return this.wahaService.createSession(sessionName);
  }

  @Get('sessions/:name/qr')
  async getQR(): Promise<any> {
    // tetap QR default
    return this.wahaService.getSessionQR();
  }

  @Get('sessions/:name/status')
  async getStatus(@Param('name') name: string): Promise<any> {
    return this.wahaService.getSessionStatus(name);
  }

  @Delete('sessions/:name')
  async deleteSession(@Param('name') name: string): Promise<any> {
    return this.wahaService.deleteSession(name);
  }

  @Post('sessions/:name/logout')
  async logout(@Param('name') name: string): Promise<any> {
    return this.wahaService.logoutSession(name);
  }
}
