import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './modules/messages/message.entity';
import { Campaign } from './modules/campaigns/campaign.entity';
import { WahaService } from './modules/waha/waha.service';
import axios from 'axios';

// Worker Processor
@Injectable()
@Processor('messages')
class MessageProcessor {
  constructor(
    @Inject(getRepositoryToken(Message)) messagesRepository,
    @Inject(getRepositoryToken(Campaign)) campaignsRepository
  ) {
    this.messagesRepository = messagesRepository;
    this.campaignsRepository = campaignsRepository;
    this.wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
  }

  @Process('send-message')
  async handleSendMessage(job) {
    const { messageId, phone, content, messageNumber } = job.data;

    console.log(`[Worker] Processing message #${messageNumber || '?'} (${messageId}) to ${phone}`);

    try {
      // Get message from database
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['campaign'],
      });

      if (!message) {
        console.error(`Message ${messageId} not found`);
        return;
      }

      // Update status to queued
      await this.messagesRepository.update(messageId, { status: 'queued' });

      // Get session from campaign
      const sessionId = message.campaign?.sessionId || 'default';
      const campaign = message.campaign;

      let response;

      // Cek apakah ada gambar + buttons (seperti di screenshot)
      if (campaign?.imageUrl && campaign?.buttons && campaign.buttons.length > 0) {
        // Kirim dengan gambar + buttons
        console.log(`[Worker] Sending image + buttons to ${phone}`);
        
        const formattedButtons = campaign.buttons.slice(0, 2).map((btn, index) => ({
          id: `btn_${index}`,
          text: btn.text,
          url: btn.url,
        }));

        response = await axios.post(
          `${this.wahaApiUrl}/api/sendButtons`,
          {
            session: sessionId,
            chatId: `${phone}@c.us`,
            text: content,
            image: { url: campaign.imageUrl },
            buttons: formattedButtons,
          },
        );
      } else if (campaign?.imageUrl) {
        // Kirim dengan gambar saja
        console.log(`[Worker] Sending image to ${phone}`);
        
        response = await axios.post(
          `${this.wahaApiUrl}/api/sendImage`,
          {
            session: sessionId,
            chatId: `${phone}@c.us`,
            file: { url: campaign.imageUrl },
            caption: content,
          },
        );
      } else {
        // Kirim text biasa
        console.log(`[Worker] Sending text to ${phone}`);
        
        response = await axios.post(
          `${this.wahaApiUrl}/api/sendText`,
          {
            session: sessionId,
            chatId: `${phone}@c.us`,
            text: content,
          },
        );
      }

      // Update message as sent
      await this.messagesRepository.update(messageId, {
        status: 'sent',
        sentAt: new Date(),
        wahaMessageId: response.data.id,
      });

      console.log(`[Worker] Message #${messageNumber || '?'} (${messageId}) sent successfully`);
      
      // Log batch pause info
      if (messageNumber && messageNumber % 10 === 0) {
        console.log(`[Worker] ⏸️  Batch pause after ${messageNumber} messages (15s delay)`);
      }

      // Update campaign stats
      if (message.campaign) {
        await this.updateCampaignStats(message.campaign.id);
      }

      return { success: true };
    } catch (error) {
      console.error(`[Worker] Failed to send message ${messageId}:`, error.message);

      // Update message as failed
      await this.messagesRepository.update(messageId, {
        status: 'failed',
        errorMessage: error.message,
      });

      // Update campaign stats
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['campaign'],
      });

      if (message?.campaign) {
        await this.updateCampaignStats(message.campaign.id);
      }

      throw error; // Will trigger retry
    }
  }

  async updateCampaignStats(campaignId) {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: campaignId },
      relations: ['messages'],
    });

    if (!campaign) return;

    const sentCount = campaign.messages.filter(
      (m) => m.status === 'sent' || m.status === 'delivered',
    ).length;
    const failedCount = campaign.messages.filter((m) => m.status === 'failed').length;
    const deliveredCount = campaign.messages.filter((m) => m.status === 'delivered').length;

    await this.campaignsRepository.update(campaignId, {
      sentCount,
      failedCount,
      deliveredCount,
      status: sentCount + failedCount >= campaign.totalRecipients ? 'completed' : 'sending',
    });
  }
}

// Bootstrap Worker
async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  console.log('🔄 Worker started and processing messages...');
  console.log(`   Pacing: ${process.env.MESSAGE_PACING_MIN || 7000}ms - ${process.env.MESSAGE_PACING_MAX || 8000}ms per message`);
  console.log(`   Batch Pause: 15s every 10 messages`);
  console.log(`   Max per Batch: ${process.env.MAX_MESSAGES_PER_BATCH || 500} messages`);
  console.log(`   Concurrency: ${process.env.WORKER_CONCURRENCY || 1}`);

  // Keep the process running
  process.on('SIGTERM', async () => {
    console.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

bootstrapWorker();
