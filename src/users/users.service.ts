import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async get_all_users(): Promise<User[]> {
    return this.usersRepository.find(); // Fetch all users
  }

  async create_user(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    const salt = await bcrypt.genSalt(); // Generate a salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword, // In a real-world app, hash the password before saving
    });

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username or email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async delete_user(userId: string): Promise<void> {
    const result = await this.usersRepository.delete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }

  async verify_user(verifyUserDto: VerifyUserDto): Promise<string> {
    const { email, password } = verifyUserDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      throw new UnauthorizedException('Invalid login credentials'); // 401 response
    }

    return 'success';
  }
}
