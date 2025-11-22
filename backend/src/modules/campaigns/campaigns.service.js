import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { MessagesService } from '../messages/messages.service';
import { ContactsService } from '../contacts/contacts.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject(getRepositoryToken(Campaign)) campaignsRepository,
    @Inject(MessagesService) messagesService,
    @Inject(ContactsService) contactsService,
    @Inject(QueueService) queueService,
  ) {
    this.campaignsRepository = campaignsRepository;
    this.messagesService = messagesService;
    this.contactsService = contactsService;
    this.queueService = queueService;
  }

  async create(userId, createCampaignDto) {
    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      user: { id: userId },
    });
    return this.campaignsRepository.save(campaign);
  }

  async findAll(userId) {
    return this.campaignsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id, userId) {
    return this.campaignsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['messages'],
    });
  }

  async update(id, userId, updateData) {
    await this.campaignsRepository.update(
      { id, user: { id: userId } },
      updateData,
    );
    return this.findOne(id, userId);
  }

  async sendCampaign(campaignId, userId, contactIds) {
    const campaign = await this.findOne(campaignId, userId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get contacts
    let contacts = await this.contactsService.findByIds(contactIds);
    
    // Limit to max 500 messages per batch
    const maxPerBatch = parseInt(process.env.MAX_MESSAGES_PER_BATCH) || 500;
    if (contacts.length > maxPerBatch) {
      console.warn(`[Campaign] Limiting ${contacts.length} contacts to ${maxPerBatch} per batch`);
      contacts = contacts.slice(0, maxPerBatch);
    }
    
    // Create messages
    const messages = [];
    for (const contact of contacts) {
      const message = await this.messagesService.create({
        campaign: { id: campaign.id },
        recipientPhone: contact.phone,
        recipientName: contact.name,
        content: campaign.message,
        status: 'pending',
      });
      messages.push(message);
    }

    // Update campaign
    await this.update(campaignId, userId, {
      status: 'sending',
      totalRecipients: contacts.length,
    });

    // Reset counter untuk batch baru
    this.queueService.resetCounter();
    
    // Add to queue
    for (const message of messages) {
      await this.queueService.addMessageToQueue(message);
    }

    return { 
      success: true, 
      totalQueued: messages.length,
      maxPerBatch,
      batchLimited: contactIds.length > maxPerBatch
    };
  }

  async updateStats(campaignId) {
    const campaign = await this.campaignsRepository.findOne({
      where: { id: campaignId },
      relations: ['messages'],
    });

    if (!campaign) return;

    const sentCount = campaign.messages.filter((m) => m.status === 'sent' || m.status === 'delivered').length;
    const failedCount = campaign.messages.filter((m) => m.status === 'failed').length;
    const deliveredCount = campaign.messages.filter((m) => m.status === 'delivered').length;

    await this.campaignsRepository.update(campaign.id, {
      sentCount,
      failedCount,
      deliveredCount,
      status: sentCount + failedCount >= campaign.totalRecipients ? 'completed' : 'sending',
    });
  }
}
