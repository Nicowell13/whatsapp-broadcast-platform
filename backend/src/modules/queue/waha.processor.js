import { Processor, Process } from '@nestjs/bull';
import axios from 'axios';
import { MessagesService } from '../messages/messages.service';

@Processor('messages')
export class WahaProcessor {
  constructor(messagesService) {
    this.messagesService = messagesService;

    this.wahaUrl = process.env.WAHA_API_URL || 'http://waha:3000';
  }

  @Process('send-message')
  async handleSendMessage(job) {
    const { messageId, phone, content } = job.data;

    const normalized = this.normalizePhone(phone);

    try {
      await axios.post(`${this.wahaUrl}/api/messages/sendText`, {
        receiver: normalized,
        text: content,
      });

      await this.messagesService.update(messageId, {
        status: 'sent',
        sentAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error('[WAHA SEND ERROR]', err?.response?.data || err.message);

      await this.messagesService.update(messageId, {
        status: 'failed',
      });

      throw err;
    }
  }

  normalizePhone(phone) {
    phone = String(phone).replace(/\D/g, '');

    if (phone.startsWith('0')) return '62' + phone.slice(1);
    if (!phone.startsWith('62')) return '62' + phone;

    return phone;
  }
}
