import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(campaignsService) {
    this.campaignsService = campaignsService;
  }

  @Post()
  async create(req, body) {
    return this.campaignsService.create(req.user.userId, body);
  }

  @Get()
  async findAll(req) {
    return this.campaignsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(req, id) {
    return this.campaignsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(req, id, body) {
    return this.campaignsService.update(id, req.user.userId, body);
  }

  @Post(':id/send')
  async send(req, id, body) {
    return this.campaignsService.sendCampaign(id, req.user.userId, body.contactIds);
  }
}
