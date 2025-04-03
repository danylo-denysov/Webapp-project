import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find(); // Fetch all users
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    const user = this.usersRepository.create({
      username,
      email,
      password, // In a real-world app, hash the password before saving
    });

    await this.usersRepository.save(user);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.usersRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }
}