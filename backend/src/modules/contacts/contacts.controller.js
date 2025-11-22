import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(contactsService) {
    this.contactsService = contactsService;
  }

  @Post()
  async create(body) {
    return this.contactsService.create(body);
  }

  @Get()
  async findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  async findOne(id) {
    return this.contactsService.findOne(id);
  }

  @Put(':id')
  async update(id, body) {
    return this.contactsService.update(id, body);
  }

  @Delete(':id')
  async delete(id) {
    return this.contactsService.delete(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(file) {
    const contacts = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          contacts.push({
            name: row.name || row.Name,
            phone: row.phone || row.Phone,
            email: row.email || row.Email,
          });
        })
        .on('end', async () => {
          const result = await this.contactsService.bulkCreate(contacts);
          resolve({ success: true, imported: result.length });
        })
        .on('error', reject);
    });
  }
}
