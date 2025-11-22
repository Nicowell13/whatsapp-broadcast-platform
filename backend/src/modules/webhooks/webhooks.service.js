import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/message.entity';

@Injectable()
export class WebhooksService {
  constructor(@Inject(getRepositoryToken(Message)) messagesRepository) {
    this.messagesRepository = messagesRepository;
  }

  async handleWahaWebhook(webhookData) {
    const { event, payload } = webhookData;

    console.log('WAHA Webhook received:', event, payload);

    // Handle message.ack event (delivery status)
    if (event === 'message.ack') {
      await this.updateMessageStatus(payload);
    }

    // Handle session.status event
    if (event === 'session.status') {
      console.log('Session status:', payload);
    }

    return { received: true };
  }

  async updateMessageStatus(ackPayload) {
    const { id, ack } = ackPayload;

    // Find message by WAHA message ID
    const message = await this.messagesRepository.findOne({
      where: { wahaMessageId: id },
    });

    if (!message) {
      console.log('Message not found for WAHA ID:', id);
      return;
    }

    // Update status based on ACK
    // ACK: 0=pending, 1=sent, 2=delivered, 3=read, -1=failed
    let status = message.status;
    let deliveredAt = message.deliveredAt;

    if (ack === 1) {
      status = 'sent';
    } else if (ack === 2 || ack === 3) {
      status = 'delivered';
      deliveredAt = new Date();
    } else if (ack === -1) {
      status = 'failed';
    }

    await this.messagesRepository.update(message.id, {
      status,
      deliveredAt,
    });

    console.log(`Message ${message.id} updated to status: ${status}`);
  }
}
