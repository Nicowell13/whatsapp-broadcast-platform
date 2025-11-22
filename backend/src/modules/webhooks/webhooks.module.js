import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { MessagesModule } from '../messages/messages.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    MessagesModule,
    CampaignsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
