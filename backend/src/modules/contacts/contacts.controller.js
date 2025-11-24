import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UploadedFile, UseInterceptors, Inject, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactsService } from './contacts.service';
import csvParser from 'csv-parser';
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
    const errors = [];
    let rowNumber = 1; // Start from 1 (header is row 0)
    const stream = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          rowNumber++;
          
          // Get values with case-insensitive fallback
          const name = (row.name || row.Name || '').trim();
          const phone = (row.phone || row.Phone || '').trim();
          const email = (row.email || row.Email || '').trim();
          
          // Validate required fields
          if (!name || !phone) {
            errors.push(`Row ${rowNumber}: Missing name or phone (name: "${name}", phone: "${phone}")`);
            return;
          }
          
          // Validate phone format (must start with 62 and be numeric)
          if (!/^62\d{9,13}$/.test(phone)) {
            errors.push(`Row ${rowNumber}: Invalid phone format "${phone}" (must be 62xxx without + or spaces)`);
            return;
          }
          
          contacts.push({
            name: name,
            phone: phone,
            email: email || null,
            userId: req.user.userId,
          });
        })
        .on('end', async () => {
          try {
            if (contacts.length === 0) {
              return reject(new Error(`No valid contacts to import. Errors: ${errors.join('; ')}`));
            }
            
            const result = await this.contactsService.bulkCreate(contacts);
            resolve({ 
              success: true, 
              imported: result.length,
              errors: errors.length > 0 ? errors : undefined
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }
}
