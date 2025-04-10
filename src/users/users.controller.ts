import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { VerifyUserDto } from './dto/verify-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.get_all_users();
  }

  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create_user(createUserDto);
  }

  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.usersService.delete_user(userId);
  }

  @Post('/verify')
  async verifyUser(@Body() verifyUserDto: VerifyUserDto): Promise<{ accessToken: string }> {
    return this.usersService.verify_user(verifyUserDto);
  }
}
