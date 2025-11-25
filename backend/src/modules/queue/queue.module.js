// src/modules/queue/queue.module.js
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';
import { QueueService } from './queue.service';
import { WahaProcessor } from './waha.processor';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'messages' }),
    TypeOrmModule.forFeature([Message]),
    MessagesModule, // <- penting: agar MessagesService tersedia untuk WahaProcessor
  ],
  providers: [ QueueService, WahaProcessor ],
  exports: [ QueueService ],
})
export class QueueModule {}
