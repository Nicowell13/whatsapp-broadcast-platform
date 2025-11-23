import { Controller, Post, Body, Inject } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    @Inject(WebhooksService)
    webhooksService,
  ) {
    this.webhooksService = webhooksService;
  }

  @Post('waha')
  async handleWaha(@Body() body) {
    return this.webhooksService.handleWahaWebhook(body);
  }
}
