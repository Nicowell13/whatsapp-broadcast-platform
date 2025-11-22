import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message } from '../messages/message.entity';
import { Contact } from '../contacts/contact.entity';

@Injectable()
export class CleanupService {
  constructor(
    @Inject(getRepositoryToken(Message)) messagesRepository,
    @Inject(getRepositoryToken(Contact)) contactsRepository,
  ) {
    this.messagesRepository = messagesRepository;
    this.contactsRepository = contactsRepository;
  }

  // Run every day at 2 AM
  @Cron('0 2 * * *')
  async cleanupOldData() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    console.log(`[Cleanup] Starting cleanup for data older than ${threeDaysAgo.toISOString()}`);

    try {
      // Delete old messages
      const deletedMessages = await this.messagesRepository.delete({
        createdAt: LessThan(threeDaysAgo),
      });

      // Delete old contacts (optional - comment out if you want to keep contacts)
      const deletedContacts = await this.contactsRepository.delete({
        createdAt: LessThan(threeDaysAgo),
      });

      console.log(`[Cleanup] Deleted ${deletedMessages.affected || 0} messages`);
      console.log(`[Cleanup] Deleted ${deletedContacts.affected || 0} contacts`);

      return {
        success: true,
        deletedMessages: deletedMessages.affected || 0,
        deletedContacts: deletedContacts.affected || 0,
      };
    } catch (error) {
      console.error('[Cleanup] Error:', error.message);
      throw error;
    }
  }

  // Manual cleanup endpoint
  async manualCleanup() {
    return this.cleanupOldData();
  }
}
