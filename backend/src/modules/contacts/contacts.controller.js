import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UploadedFile, UseInterceptors, Inject, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(@Inject(ContactsService) contactsService) {
    this.contactsService = contactsService;
  }

  @Post()
  async create(@Body() body, @Request() req) {
    return this.contactsService.create({ ...body, userId: req.user.userId });
  }

  @Get()
  async findAll() {
    return this.contactsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id) {
    return this.contactsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id, @Body() body) {
    return this.contactsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id) {
    return this.contactsService.delete(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file, @Request() req) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const contacts = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          // Skip empty rows
          if (!row.name && !row.phone) return;
          
          contacts.push({
            name: row.name || row.Name,
            phone: row.phone || row.Phone,
            email: row.email || row.Email || null,
            userId: req.user.userId,
          });
        })
        .on('end', async () => {
          try {
            const result = await this.contactsService.bulkCreate(contacts);
            resolve({ success: true, imported: result.length });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }
}
