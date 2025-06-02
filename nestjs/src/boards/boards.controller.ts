// boards.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { RenameBoardDto } from './dto/rename-board.dto';
import { UpdateBoardUserRoleDto } from './dto/update-board-user-role.dto';
import { Board } from './board.entity';
import { BoardUser } from './board-user.entity';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { User } from 'src/users/user.entity';
import { GetUser } from 'src/users/get-user.decorator';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Boards')
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('/user')
  @ApiOperation({
    summary: 'Retrieve all Boards owned by the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of Board objects returned successfully',
    type: Board,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  getUserBoards(@GetUser() user: User): Promise<Board[]> {
    return this.boardsService.get_user_boards(user.id);
  }

  @Post('/user')
  @ApiOperation({ summary: 'Create a new Board for the authenticated user' })
  @ApiBody({
    description: 'Payload to create a new Board',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Development Roadmap' },
      },
      required: ['name'],
    },
  })
  @ApiCreatedResponse({
    description: 'Board created successfully',
    type: Board,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (400) – e.g., missing or empty name field',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., name does not meet class-validator rules',
  })
  @ApiNotFoundResponse({
    description: 'User not found (404)',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  createBoard(
    @GetUser() user: User,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.create_board(createBoardDto, user.id);
  }

  @Delete('/:boardId/user')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a Board owned by the authenticated user',
  })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board to delete',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiNoContentResponse({
    description: 'Board deleted successfully (no content)',
  })
  @ApiNotFoundResponse({
    description: 'Board not found or user does not have access (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  deleteBoard(
    @Param('boardId') boardId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.delete_board(boardId, user.id);
  }

  @Get('/:boardId/user')
  @ApiOperation({
    summary: 'Retrieve details of a specific Board for the authenticated user',
  })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board to retrieve',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiResponse({
    status: 200,
    description: 'Board object returned successfully',
    type: Board,
  })
  @ApiNotFoundResponse({
    description: 'Board not found or user does not have access (404)',
  })
  @ApiForbiddenResponse({
    description:
      'Forbidden (403) – user is not the owner or collaborator of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  getBoardById(
    @Param('boardId') boardId: string,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.get_board_by_id(boardId, user.id);
  }

  @Patch('/:boardId/user')
  @ApiOperation({ summary: 'Rename an existing Board' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board to rename',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiBody({
    description: 'Payload containing the new name for the Board',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Q3 Development Plan' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Board renamed successfully',
    type: Board,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (400) – e.g., empty name',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., name does not meet class-validator rules',
  })
  @ApiNotFoundResponse({
    description: 'Board not found or user does not have access (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  renameBoard(
    @Param('boardId') boardId: string,
    @Body() renameBoardDto: RenameBoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.rename_board(
      boardId,
      renameBoardDto.name,
      user.id,
    );
  }

  @Post('/:boardId/users/:userId')
  @ApiOperation({
    summary:
      'Add a user to a Board with a specified role (Owner, Editor, or Viewer)',
  })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the User to add to the Board',
    example: 'user-uuid-1234-5678-9012-abcdef345678',
  })
  @ApiBody({
    description: 'Payload specifying the role to assign to the user',
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['Owner', 'Editor', 'Viewer'],
          example: 'Editor',
        },
      },
      required: ['role'],
    },
  })
  @ApiCreatedResponse({
    description: 'User added to board successfully',
    type: BoardUser,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request (400) – e.g., user already assigned to board',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed (422) – e.g., invalid enum value for role',
  })
  @ApiNotFoundResponse({
    description: 'Board or User not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – authenticated user is not the board owner',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  addUserToBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    @GetUser() user: User,
  ): Promise<BoardUser> {
    return this.boardsService.add_user_to_board(
      boardId,
      userId,
      updateBoardUserRoleDto,
      user.id,
    );
  }

  @Delete('/:boardId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user from a Board' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiParam({
    name: 'userId',
    description: 'UUID of the User to remove',
    example: 'user-uuid-1234-5678-9012-abcdef345678',
  })
  @ApiNoContentResponse({
    description: 'User removed from board successfully (no content)',
  })
  @ApiNotFoundResponse({
    description: 'Board not found or User not assigned to board (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – authenticated user is not the board owner',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  removeUserFromBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.remove_user_from_board(boardId, userId, user.id);
  }

  @Get('/:boardId/users')
  @ApiOperation({
    summary: 'Get all users (with their roles) associated with a Board',
  })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of BoardUser objects returned successfully',
    type: BoardUser,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Board not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – authenticated user is not the board owner',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  getBoardUsers(@Param('boardId') boardId: string): Promise<BoardUser[]> {
    return this.boardsService.get_board_users(boardId);
  }
}
