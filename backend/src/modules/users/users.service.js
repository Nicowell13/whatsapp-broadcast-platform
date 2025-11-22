import { Injectable, Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject(getRepositoryToken(User)) usersRepository) {
    this.usersRepository = usersRepository;
  }

  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'isActive', 'createdAt'],
    });
  }

  async deleteUser(userId) {
    // Delete user (cascade will delete campaigns, contacts, messages)
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    await this.usersRepository.remove(user);
    return { success: true, message: 'User and all associated data deleted' };
  }
}
