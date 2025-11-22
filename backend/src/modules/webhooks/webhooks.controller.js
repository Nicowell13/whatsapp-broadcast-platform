import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(webhooksService) {
    this.webhooksService = webhooksService;
  }

  @Post('waha')
  async handleWaha(body) {
    return this.webhooksService.handleWahaWebhook(body);
  }
}
