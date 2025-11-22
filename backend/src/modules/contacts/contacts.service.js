import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactsService {
  constructor(@Inject(getRepositoryToken(Contact)) contactsRepository) {
    this.contactsRepository = contactsRepository;
  }

  async create(contactData) {
    const contact = this.contactsRepository.create(contactData);
    return this.contactsRepository.save(contact);
  }

  async findAll() {
    return this.contactsRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id) {
    return this.contactsRepository.findOne({ where: { id } });
  }

  async findByIds(ids) {
    return this.contactsRepository.find({
      where: { id: In(ids), isActive: true },
    });
  }

  async update(id, updateData) {
    await this.contactsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id) {
    return this.contactsRepository.update(id, { isActive: false });
  }

  async bulkCreate(contacts) {
    const entities = this.contactsRepository.create(contacts);
    return this.contactsRepository.save(entities);
  }
}
