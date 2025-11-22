import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/message.entity';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messages',
    }),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
