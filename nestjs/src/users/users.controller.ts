import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { User } from './user.entity';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { ChangeNicknameDto } from './dto/change-nickname.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from './get-user.decorator';
import { JwtUserPayload, JwtRefreshPayload } from './jwt-user-payload.interface';

const REFRESH_TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers(): Promise<User[]> {
    return this.usersService
      .getAllUsers()
      .then((users) => users.filter((u): u is User => u !== undefined));
  }

  @Post('/create')
  createUser(@Body() createUserDto: CreateUserDto): Promise<Partial<User>> {
    return this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/nickname')
  @HttpCode(HttpStatus.OK)
  async changeNickname(
    @GetUser() user: JwtUserPayload,
    @Body() dto: ChangeNicknameDto,
  ): Promise<void> {
    return this.usersService.updateNickname(user.id, dto.newNickname);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser() user: JwtUserPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
      dto.repeatPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyAccount(@GetUser() user: JwtUserPayload): Promise<void> {
    return this.usersService.deleteUserById(user.id);
  }

  @Delete('/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.usersService.deleteUser(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify')
  verifyUser(
    @Body() verifyUserDto: VerifyUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    return this.usersService
      .verifyUser(verifyUserDto)
      .then(({ accessToken: at, refreshToken: rt }) => {
        response.cookie('refresh_token', rt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/users',
          maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        });
        return { accessToken: at };
      });
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refreshTokens(
    @GetUser() user: JwtRefreshPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    return this.usersService
      .refreshTokens(user.id, user.refreshToken)
      .then(({ accessToken: newAT, refreshToken: newRT }) => {
        response.cookie('refresh_token', newRT, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/api/users',
          maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
        });
        return { accessToken: newAT };
      });
  }
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getCurrentUser(@GetUser() user: JwtUserPayload): Promise<Partial<User>> {
    const found = await this.usersService.findById(user.id);
    return {
      id: found.id,
      username: found.username,
      email: found.email,
      created_at: found.created_at,
    };
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(
    @GetUser() user: JwtUserPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.usersService.removeRefreshToken(user.id);

    // Clear the cookie on the response
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/users/refresh',
    });
  }
}
