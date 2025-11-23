import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(@Inject(CampaignsService) campaignsService) {
    this.campaignsService = campaignsService;
  }

  @Post()
  async create(@Request() req, @Body() body) {
    return this.campaignsService.create(req.user.userId, body);
  }

  @Get()
  async findAll(@Request() req) {
    return this.campaignsService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id) {
    return this.campaignsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id, @Body() body) {
    return this.campaignsService.update(id, req.user.userId, body);
  }

  @Post(':id/send')
  async send(@Request() req, @Param('id') id, @Body() body) {
    return this.campaignsService.sendCampaign(id, req.user.userId, body.contactIds);
  }
}
