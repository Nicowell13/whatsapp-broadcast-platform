import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { MessagesService } from '../messages/messages.service';

@Injectable()
@Processor('messages')
export class WahaProcessor {
  private readonly logger = new Logger(WahaProcessor.name);
  private readonly wahaUrl: string;

  constructor(private readonly messagesService: MessagesService) {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://waha:3000';
  }

  @Process('send-message')
  async handleSendMessage(job: any) {
    const { messageId, phone, content, media } = job.data;

    this.logger.debug(`Processing messageId=${messageId}, to=${phone}`);

    try {
      const receiver = this.normalizePhone(phone);

      if (media && media.url) {
        // SEND MEDIA
        await axios.post(
          `${this.wahaUrl}/api/messages/sendMedia`,
          {
            receiver,
            media: media.url,
            mimeType: media.mime || 'application/octet-stream',
            caption: content || '',
          },
          { timeout: 60000 },
        );

        this.logger.debug(`Media sent to ${receiver}`);
      } else {
        // SEND TEXT
        await axios.post(
          `${this.wahaUrl}/api/messages/sendText`,
          {
            receiver,
            text: content,
          },
          { timeout: 30000 },
        );

        this.logger.debug(`Text sent to ${receiver}`);
      }

      await this.messagesService.update(messageId, {
        status: 'sent',
        sentAt: new Date(),
      });

      this.logger.log(`Message ${messageId} marked as sent.`);
      return true;
    } catch (err: any) {
      this.logger.error(
        `Send failed for message ${messageId}: ${
          err?.response?.data || err?.message
        }`,
      );

      await this.messagesService.update(messageId, {
        status: 'failed',
      });

      throw err;
    }
  }

  private normalizePhone(phone: string): string {
    phone = phone.replace(/\D/g, '');

    if (phone.startsWith('0')) return '62' + phone.slice(1);
    if (!phone.startsWith('62')) return '62' + phone;
    return phone;
  }
}
