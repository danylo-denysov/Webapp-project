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
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Controller('users')
export class UsersController {
  private readonly REFRESH_TOKEN_COOKIE_MAX_AGE: number;
  private readonly ACCESS_TOKEN_COOKIE_MAX_AGE: number;

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    // Cookie maxAge in milliseconds (must match JWT token TTL)
    // Using getOrThrow to enforce proper .env configuration
    this.ACCESS_TOKEN_COOKIE_MAX_AGE = parseInt(
      this.configService.getOrThrow<string>('ACCESS_TOKEN_COOKIE_MAX_AGE'), // 15 minutes
      10,
    );
    this.REFRESH_TOKEN_COOKIE_MAX_AGE = parseInt(
      this.configService.getOrThrow<string>('REFRESH_TOKEN_COOKIE_MAX_AGE'), // 7 days
      10,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(@Query('search') search?: string): Promise<Partial<User>[]> {
    if (search) {
      return this.usersService.searchUsers(search);
    }
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
  ): Promise<{ success: boolean }> {
    return this.usersService
      .verifyUser(verifyUserDto)
      .then(({ accessToken: at, refreshToken: rt }) => {
        // Set access token cookie (15 minutes)
        response.cookie('access_token', at, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: this.ACCESS_TOKEN_COOKIE_MAX_AGE, // 15 minutes
        });

        // Set refresh token cookie (7 days)
        response.cookie('refresh_token', rt, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: this.REFRESH_TOKEN_COOKIE_MAX_AGE, // 7 days
        });
        return { success: true };
      });
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refreshTokens(
    @GetUser() user: JwtRefreshPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    return this.usersService
      .refreshTokens(user.id, user.refreshToken)
      .then(({ accessToken: newAT, refreshToken: newRT }) => {
        // Set new access token cookie (15 minutes)
        response.cookie('access_token', newAT, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: this.ACCESS_TOKEN_COOKIE_MAX_AGE, // 15 minutes
        });

        // Set new refresh token cookie (7 days)
        response.cookie('refresh_token', newRT, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: this.REFRESH_TOKEN_COOKIE_MAX_AGE, // 7 days
        });
        return { success: true };
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

    // Clear access token cookie
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    // Clear refresh token cookie
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }
}
