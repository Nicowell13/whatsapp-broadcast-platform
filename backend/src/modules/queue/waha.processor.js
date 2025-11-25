// src/modules/queue/waha.processor.js
import { Processor, Process } from '@nestjs/bull';
import axios from 'axios';

@Processor('messages')
export class WahaProcessor {
  constructor(messagesService) {
    this.messagesService = messagesService;
    this.wahaUrl = process.env.WAHA_API_URL || 'http://waha:3000';
  }

  @Process('send-message')
  async handleSendMessage(job) {
    const { messageId, phone, content, media } = job.data;
    const normalized = this.normalizePhone(phone || '');

    try {
      if (!normalized) throw new Error('Invalid phone number');

      if (media && media.url) {
        await axios.post(`${this.wahaUrl}/api/messages/sendMedia`, {
          receiver: normalized,
          media: media.url,
          mimeType: media.mime || 'application/octet-stream',
          caption: content || '',
        }, { timeout: 60000 });
      } else {
        await axios.post(`${this.wahaUrl}/api/messages/sendText`, {
          receiver: normalized,
          text: content,
        }, { timeout: 30000 });
      }

      await this.messagesService.update(messageId, {
        status: 'sent',
        sentAt: new Date(),
      });

      return true;
    } catch (err) {
      console.error('[WahaProcessor] send error:', err?.response?.data || err?.message || err);
      try {
        await this.messagesService.update(messageId, { status: 'failed' });
      } catch (e) {
        console.error('[WahaProcessor] failed to update message status', e);
      }
      throw err; // biarkan Bull retry sesuai options job
    }
  }

  normalizePhone(phone) {
    phone = String(phone).replace(/\D/g, '');
    if (!phone) return '';
    if (phone.startsWith('0')) return '62' + phone.slice(1);
    if (!phone.startsWith('62')) return '62' + phone;
    return phone;
  }
}
