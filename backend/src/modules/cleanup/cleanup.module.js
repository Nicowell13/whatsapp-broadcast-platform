import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';
import { Message } from '../messages/message.entity';
import { Contact } from '../contacts/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Contact])],
  providers: [CleanupService],
  controllers: [CleanupController],
  exports: [CleanupService],
})
export class CleanupModule {}
