import { Controller, Get, Param, UseGuards, Query, Res, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(@Inject(MessagesService) messagesService) {
    this.messagesService = messagesService;
  }

  @Get()
  async findAll(@Query() query) {
    return this.messagesService.findAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.messagesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id) {
    return this.messagesService.findOne(id);
  }

  @Get('export/today')
  async exportToday(res) {
    const csv = await this.messagesService.exportTodayMessages();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="messages-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(csv);
  }
}
