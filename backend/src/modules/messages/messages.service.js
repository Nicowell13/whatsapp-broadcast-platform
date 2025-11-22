import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(@Inject(getRepositoryToken(Message)) messagesRepository) {
    this.messagesRepository = messagesRepository;
  }

  async create(messageData) {
    const message = this.messagesRepository.create(messageData);
    return this.messagesRepository.save(message);
  }

  async findAll(filters = {}) {
    return this.messagesRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(id) {
    return this.messagesRepository.findOne({ where: { id } });
  }

  async update(id, updateData) {
    await this.messagesRepository.update(id, updateData);
    return this.findOne(id);
  }

  async getStats() {
    const total = await this.messagesRepository.count();
    const sent = await this.messagesRepository.count({ where: { status: 'sent' } });
    const delivered = await this.messagesRepository.count({ where: { status: 'delivered' } });
    const failed = await this.messagesRepository.count({ where: { status: 'failed' } });
    const pending = await this.messagesRepository.count({ where: { status: 'pending' } });

    return { total, sent, delivered, failed, pending };
  }

  async exportTodayMessages() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const messages = await this.messagesRepository.find({
      where: {
        createdAt: Between(today, tomorrow),
      },
      order: { createdAt: 'DESC' },
    });

    // Convert to CSV
    const headers = 'ID,Recipient Name,Recipient Phone,Content,Status,Sent At,Created At\n';
    const rows = messages.map(m => 
      `${m.id},"${m.recipientName}",${m.recipientPhone},"${m.content}",${m.status},${m.sentAt || ''},${m.createdAt}`
    ).join('\n');

    return headers + rows;
  }
}
