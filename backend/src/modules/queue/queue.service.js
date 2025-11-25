import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('messages') messageQueue) {
    this.messageQueue = messageQueue;
    this.messageCounter = 0;
  }

  async addMessageToQueue(message) {
    this.messageCounter++;

    let delay = this.getRandomDelay();

    if (this.messageCounter % 10 === 0) {
      const batchPause = parseInt(process.env.BATCH_PAUSE_DURATION) || 15000;
      delay += batchPause;
      console.log(`[Queue] Batch Pause +${batchPause}ms after ${this.messageCounter} messages`);
    }

    await this.messageQueue.add(
      'send-message',
      {
        messageId: message.id,
        phone: message.recipientPhone,
        content: message.content,
      },
      {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      }
    );

    return { queued: true, delay, number: this.messageCounter };
  }

  getRandomDelay() {
    const min = parseInt(process.env.MESSAGE_PACING_MIN) || 7000;
    const max = parseInt(process.env.MESSAGE_PACING_MAX) || 8000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  resetCounter() {
    this.messageCounter = 0;
    console.log('[Queue] Counter Reset');
  }
}
