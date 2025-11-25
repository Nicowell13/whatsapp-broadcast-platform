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
    const { messageId, phone, content, media } = job.data || {};
    this.logger.debug(`Processing job ${job.id} messageId=${messageId} phone=${phone}`);

    // Basic validation
    if (!messageId) {
      this.logger.error('Job missing messageId; skipping');
      return;
    }

    const receiver = this.normalizePhone(String(phone || ''));
    if (!receiver) {
      this.logger.error(`Invalid phone for message ${messageId}: "${phone}"`);
      // mark failed in DB (invalid input) and don't throw to avoid useless retries
      try {
        await this.messagesService.update(messageId, { status: 'failed', error: 'invalid_phone' });
      } catch (e) {
        this.logger.error('Failed updating message status for invalid phone', e);
      }
      return;
    }

    try {
      let res;
      if (media && media.url) {
        // Try to send media; if endpoint doesn't exist or fails, fallback to text
        try {
          res = await axios.post(
            `${this.wahaUrl}/api/messages/sendMedia`,
            {
              receiver,
              media: media.url,
              mimeType: media.mime || 'application/octet-stream',
              caption: content || '',
            },
            { timeout: 60000 },
          );
        } catch (err) {
          this.logger.warn('sendMedia failed, falling back to sendText', err?.message || err);
          res = await axios.post(
            `${this.wahaUrl}/api/messages/sendText`,
            {
              receiver,
              text: content || (media.caption || ''),
            },
            { timeout: 30000 },
          );
        }
      } else {
        // Send text
        res = await axios.post(
          `${this.wahaUrl}/api/messages/sendText`,
          {
            receiver,
            text: content || '',
          },
          { timeout: 30000 },
        );
      }

      const ok = res && res.status >= 200 && res.status < 300;
      if (ok) {
        try {
          await this.messagesService.update(messageId, {
            status: 'sent',
            sentAt: new Date(),
            meta: { wahaResponseStatus: res.status },
          });
        } catch (e) {
          this.logger.error('Failed to update message record after send', e);
        }
      } else {
        this.logger.error('WAHA returned non-success status', res?.status, res?.data);
        // Let the job fail so Bull will retry according to attempts/backoff.
        throw new Error(`Waha non-2xx: ${res?.status}`);
      }

      return true;
    } catch (err: any) {
      const errMsg = err?.response?.data || err?.message || String(err);
      this.logger.error(`Send failed for message ${messageId}: ${errMsg}`);

      // Mark as 'error' (not final 'failed') so that DB shows there was an error,
      // but allow Bull to retry according to the job options (attempts/backoff).
      try {
        await this.messagesService.update(messageId, {
          status: 'error',
          lastError: typeof errMsg === 'string' ? errMsg.slice(0, 1000) : JSON.stringify(errMsg),
        });
      } catch (e) {
        this.logger.error('Failed to update message status on error', e);
      }

      // rethrow to allow Bull to retry the job based on attempts/backoff
      throw err;
    }
  }

  private normalizePhone(phone: string): string {
    if (!phone) return '';
    phone = phone.replace(/\D/g, '');
    if (phone.startsWith('0')) return '62' + phone.slice(1);
    if (!phone.startsWith('62')) return '62' + phone;
    return phone;
  }
}
