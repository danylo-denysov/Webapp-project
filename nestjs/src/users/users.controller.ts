import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { VerifyUserDto } from './dto/verify-user.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { Response, Request } from 'express';

const REFRESH_TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.get_all_users().then(users => users.filter((u): u is User => u !== undefined));
  }

  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<Partial<User>> {
    return this.usersService.create_user(createUserDto);
  }

  @Delete('/:userId')
  async deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.usersService.delete_user(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify')
  async verifyUser(
    @Body() verifyUserDto: VerifyUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken } = await this.usersService.verify_user(verifyUserDto);
    const tokens = await this.usersService.verify_user(verifyUserDto);
    const { accessToken: at, refreshToken: rt } = tokens;
    response.cookie('refresh_token', rt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only https in production
      sameSite: 'strict',
      path: '/api/users/refresh',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE, // 7 days
    });

    return { accessToken: at };
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { userId, refreshToken } = request.user as any;

    const tokens = await this.usersService.refreshTokens(userId, refreshToken);
    const { accessToken: newAT, refreshToken: newRT } = tokens;

    response.cookie('refresh_token', newRT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/users/refresh',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE, // 7 days
    });

    return { accessToken: newAT };
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userId } = request.user as any;
    await this.usersService.removeRefreshToken(userId);
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/users/refresh',
    });
  }
}
