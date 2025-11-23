const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');

const { Message } = require('../messages/message.entity');
const { WebhooksController } = require('./webhooks.controller');
const { WebhooksService } = require('./webhooks.service');
const { MessagesModule } = require('../messages/messages.module');
const { CampaignsModule } = require('../campaigns/campaigns.module');

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    MessagesModule,
    CampaignsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
class WebhooksModule {}

module.exports = { WebhooksModule };
