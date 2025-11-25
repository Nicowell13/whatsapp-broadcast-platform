import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';
import { MessagesService } from '../messages/messages.service';

@Processor('messages')
export class WahaProcessor {
  private wahaUrl: string;

  constructor(private readonly messagesService: MessagesService) {
    this.wahaUrl = process.env.WAHA_API_URL || 'http://waha:3000';
  }

  @Process('send-message')
  async handleSendMessage(job: Job) {
    const { messageId, phone, content } = job.data;

    try {
      const res = await axios.post(`${this.wahaUrl}/api/messages/sendText`, {
        receiver: phone,
        text: content,
      });

      await this.messagesService.update(messageId, {
        status: 'sent',
        sentAt: new Date(),
        wahaMessageId: res.data?.id || null,
      });

      return true;
    } catch (error) {
      console.error('[WAHA ERROR] ', error?.response?.data || error.message);

      await this.messagesService.update(messageId, {
        status: 'failed',
        errorMessage: error?.message || 'WAHA send failed',
      });

      throw error;
    }
  }
}
