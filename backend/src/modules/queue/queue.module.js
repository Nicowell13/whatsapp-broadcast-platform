import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { WahaProcessor } from './waha.processor';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'messages' }),
    MessagesModule,  // ← WAJIB
  ],
  providers: [
    QueueService,
    WahaProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
