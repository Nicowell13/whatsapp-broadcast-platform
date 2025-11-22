import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('messages') messageQueue) {
    this.messageQueue = messageQueue;
    this.messageCounter = 0; // Counter untuk batch pause
  }

  async addMessageToQueue(message) {
    // Increment counter
    this.messageCounter++;
    
    // Calculate delay: base delay + batch pause if needed
    let delay = this.getRandomDelay();
    
    // Setiap 10 pesan, tambah jeda 15 detik
    if (this.messageCounter % 10 === 0) {
      const batchPauseDuration = parseInt(process.env.BATCH_PAUSE_DURATION) || 15000;
      delay += batchPauseDuration;
      console.log(`[Queue] Batch pause after ${this.messageCounter} messages: +${batchPauseDuration}ms`);
    }
    
    await this.messageQueue.add(
      'send-message',
      {
        messageId: message.id,
        phone: message.recipientPhone,
        content: message.content,
        messageNumber: this.messageCounter, // Track message number
      },
      {
        delay, // Random delay + batch pause
        attempts: 3, // Retry 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return { queued: true, delay, messageNumber: this.messageCounter };
  }

  // Random delay between 7-8 seconds (anti-banned)
  getRandomDelay() {
    const min = parseInt(process.env.MESSAGE_PACING_MIN) || 7000;
    const max = parseInt(process.env.MESSAGE_PACING_MAX) || 8000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Reset counter untuk batch baru
  resetCounter() {
    this.messageCounter = 0;
    console.log('[Queue] Message counter reset');
  }

  async getQueueStats() {
    const waiting = await this.messageQueue.getWaitingCount();
    const active = await this.messageQueue.getActiveCount();
    const completed = await this.messageQueue.getCompletedCount();
    const failed = await this.messageQueue.getFailedCount();
    const delayed = await this.messageQueue.getDelayedCount();

    return { waiting, active, completed, failed, delayed };
  }

  async clearQueue() {
    await this.messageQueue.empty();
    await this.messageQueue.clean(0, 'completed');
    await this.messageQueue.clean(0, 'failed');
    return { cleared: true };
  }
}
