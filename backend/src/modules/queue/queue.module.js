import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';
import { QueueService } from './queue.service';
import { WahaProcessor } from './waha.processor';
import { MessagesService } from '../messages/messages.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messages',
    }),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [QueueService, WahaProcessor, MessagesService],
  exports: [QueueService],
})
export class QueueModule {}
