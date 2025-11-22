import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../campaigns/campaign.entity';
import { Message } from '../messages/message.entity';
import { Contact } from '../contacts/contact.entity';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(getRepositoryToken(Campaign)) campaignsRepository,
    @Inject(getRepositoryToken(Message)) messagesRepository,
    @Inject(getRepositoryToken(Contact)) contactsRepository,
  ) {
    this.campaignsRepository = campaignsRepository;
    this.messagesRepository = messagesRepository;
    this.contactsRepository = contactsRepository;
  }

  async getStats() {
    const totalCampaigns = await this.campaignsRepository.count();
    const activeCampaigns = await this.campaignsRepository.count({
      where: { status: 'sending' },
    });
    const totalMessages = await this.messagesRepository.count();
    const sentMessages = await this.messagesRepository.count({
      where: { status: 'sent' },
    });
    const deliveredMessages = await this.messagesRepository.count({
      where: { status: 'delivered' },
    });
    const failedMessages = await this.messagesRepository.count({
      where: { status: 'failed' },
    });
    const totalContacts = await this.contactsRepository.count({
      where: { isActive: true },
    });

    return {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
      messages: {
        total: totalMessages,
        sent: sentMessages,
        delivered: deliveredMessages,
        failed: failedMessages,
        successRate: totalMessages > 0 ? ((deliveredMessages / totalMessages) * 100).toFixed(2) : 0,
      },
      contacts: {
        total: totalContacts,
      },
    };
  }

  async getRecentActivity() {
    const recentCampaigns = await this.campaignsRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentMessages = await this.messagesRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      recentCampaigns,
      recentMessages,
    };
  }
}
