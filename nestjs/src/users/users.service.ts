import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const ACCESS_TOKEN_TTL = 60 * 15; // 15 minutes
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService, // Injecting JwtService for JWT token generation
  ) {}

  async get_all_users(): Promise<Partial<User[]>> {
    return this.usersRepository.find({ select: ['id', 'email', 'username'] }); // Fetch all users
  }

  //Salt hashing technic used
  async create_user(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { username, email, password } = createUserDto;

    const salt = await bcrypt.genSalt(); // Generate a salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    try {
      await this.usersRepository.save(user);
      const { id } = user;
      return { id, username, email };
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

  async verify_user(verifyUserDto: VerifyUserDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = verifyUserDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const payload = { email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'topSecret51',
      expiresIn: ACCESS_TOKEN_TTL, // 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: 'refreshSecret51',
      expiresIn: REFRESH_TOKEN_TTL, // 7 days
    });

    user.current_hashed_refresh_token = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.save(user);

    return { accessToken, refreshToken };
  }

  async update_nickname(userId: string, newNickname: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.usersRepository.findOne({
      where: { username: newNickname },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Nickname already in use');
    }

    user.username = newNickname;
    try {
      await this.usersRepository.save(user);
    } catch (err) {
      throw new InternalServerErrorException('Failed to update nickname');
    }
  }

  async change_password(
    userId: string,
    currentPassword: string,
    newPassword: string,
    repeatPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (newPassword !== repeatPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;

    try {
      await this.usersRepository.save(user);
    } catch (err) {
      throw new InternalServerErrorException('Failed to update password');
    }
  }

  async delete_user_by_id(userId: string): Promise<void> {
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }

  // Helpers for JWT token management

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.current_hashed_refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.current_hashed_refresh_token);
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Access Denied');
    }

    const payload = { email: user.email, sub: user.id };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: 'topSecret51',
      expiresIn: ACCESS_TOKEN_TTL, // 15 minutes
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: 'refreshSecret51',
      expiresIn: REFRESH_TOKEN_TTL, // 7 days
    });

    user.current_hashed_refresh_token = await bcrypt.hash(newRefreshToken, 10);
    await this.usersRepository.save(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.current_hashed_refresh_token = null;
    await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async findById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
