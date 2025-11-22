import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { MessagesModule } from '../messages/messages.module';
import { ContactsModule } from '../contacts/contacts.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign]),
    MessagesModule,
    ContactsModule,
    QueueModule,
  ],
  providers: [CampaignsService],
  controllers: [CampaignsController],
  exports: [CampaignsService],
})
export class CampaignsModule {}
