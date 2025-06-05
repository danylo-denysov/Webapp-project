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
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { User } from './user.entity';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnprocessableEntityResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ChangeNicknameDto } from './dto/change-nickname.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetUser } from './get-user.decorator';

const REFRESH_TOKEN_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users in the system' })
  @ApiResponse({
    status: 200,
    description: 'Array of User objects returned successfully',
    type: User,
    isArray: true,
  })
  getAllUsers(): Promise<User[]> {
    return this.usersService
      .get_all_users()
      .then((users) => users.filter((u): u is User => u !== undefined));
  }

  @Post('/create')
  @ApiOperation({ summary: 'Create a new User' })
  @ApiBody({
    description: 'Payload to create a new user',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'johndoe' },
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        password: { type: 'string', example: 'S3cur3P@ssw0rd' },
      },
      required: ['username', 'email', 'password'],
    },
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: User,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request (400) – missing or invalid fields (e.g., empty username)',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., email not valid or password too short',
  })
  @ApiConflictResponse({
    description: 'Conflict (409) – username or email already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error (500)',
  })
  createUser(@Body() createUserDto: CreateUserDto): Promise<Partial<User>> {
    return this.usersService.create_user(createUserDto);
  }

    @UseGuards(JwtAuthGuard)
  @Patch('/me/nickname')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user’s nickname' })
  @ApiBody({ type: ChangeNicknameDto })
  @ApiOkResponse({
    description: 'Nickname changed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (422)',
  })
  @ApiConflictResponse({
    description: 'Nickname already in use (409)',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401)',
  })
  async changeNickname(
    @GetUser() user: any,
    @Body() dto: ChangeNicknameDto,
  ): Promise<void> {
    return this.usersService.update_nickname(user.id, dto.newNickname);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change current user’s password',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (422)',
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is wrong (401)',
  })
  async changePassword(
    @GetUser() user: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.change_password(
      user.id,
      dto.currentPassword,
      dto.newPassword,
      dto.repeatPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete current user’s account',
  })
  @ApiNoContentResponse({
    description: 'Account deleted successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401)',
  })
  async deleteMyAccount(@GetUser() user: any): Promise<void> {
    return this.usersService.delete_user_by_id(user.id);
  }

  @Delete('/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a User by ID' })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the User to delete',
    example: 'user-uuid-1234-5678-9012-abcdef345678',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully (no content)',
  })
  @ApiNotFoundResponse({
    description: 'User not found (404)',
  })
  deleteUser(@Param('userId') userId: string): Promise<void> {
    return this.usersService.delete_user(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/verify')
  @ApiOperation({
    summary:
      'Verify user credentials (login); returns an access token and sets a refresh token cookie',
  })
  @ApiBody({
    description: 'Payload containing login credentials',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
        },
        password: { type: 'string', example: 'S3cur3P@ssw0rd' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description:
      'Credentials valid; returns { accessToken } and sets a refresh token cookie',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request (400) – missing or malformed fields',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – invalid email or password',
  })
  verifyUser(
    @Body() verifyUserDto: VerifyUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    return this.usersService
      .verify_user(verifyUserDto)
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
  @ApiOperation({
    summary:
      'Refresh JWT tokens using a valid refresh token cookie; returns new access token and updates refresh token cookie',
  })
  @ApiOkResponse({
    description: 'New access token returned; refresh token cookie updated',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'newAccessTokenHere...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid refresh token cookie',
  })
  @ApiNotFoundResponse({
    description: 'User not found (404)',
  })
  refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { userId, refreshToken } = request.user as any;
    return this.usersService
      .refreshTokens(userId, refreshToken)
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
  @ApiOperation({
    summary: 'Get current user’s profile info',
  })
  @ApiOkResponse({
    description: 'Current user returned',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401)',
  })
  async getCurrentUser(@GetUser() user: any): Promise<Partial<User>> {
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
  @ApiOperation({
    summary:
      'Logout the user by invalidating the refresh token and clearing the cookie',
  })
  @ApiOkResponse({
    description: 'Logout successful; refresh token cookie cleared',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid refresh token cookie',
  })
  @ApiNotFoundResponse({
    description: 'User not found (404)',
  })
  async logout(
    @GetUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // user.userId was set by JwtRefreshStrategy.validate()
    await this.usersService.removeRefreshToken(user.userId);

    // Clear the cookie on the response
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/users/refresh',
    });
  }
}
