import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Campaign } from '../campaigns/campaign.entity';
import { Message } from '../messages/message.entity';
import { Contact } from '../contacts/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Message, Contact]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
