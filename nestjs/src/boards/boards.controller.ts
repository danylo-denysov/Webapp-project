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
import { GetUser } from 'src/users/get-user.decorator';
import { JwtUserPayload } from 'src/users/jwt-user-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('/user')
  getUserBoards(@GetUser() user: JwtUserPayload): Promise<Board[]> {
    return this.boardsService.getUserBoards(user.id);
  }

  @Post('/user')
  createBoard(
    @GetUser() user: JwtUserPayload,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.createBoard(createBoardDto, user.id);
  }

  @Delete('/:boardId/user')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBoard(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    return this.boardsService.deleteBoard(boardId, user.id);
  }

  @Get('/:boardId/user')
  getBoardById(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<Board> {
    return this.boardsService.getBoardById(boardId, user.id);
  }

  @Patch('/:boardId/user')
  renameBoard(
    @Param('boardId') boardId: string,
    @Body() renameBoardDto: RenameBoardDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<Board> {
    return this.boardsService.renameBoard(
      boardId,
      renameBoardDto.name,
      user.id,
    );
  }

  @Post('/:boardId/users/:userId')
  addUserToBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<BoardUser> {
    return this.boardsService.addUserToBoard(
      boardId,
      userId,
      updateBoardUserRoleDto,
      user.id,
    );
  }

  @Patch('/:boardId/users/:userId')
  updateUserRole(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<BoardUser> {
    return this.boardsService.updateUserRole(
      boardId,
      userId,
      updateBoardUserRoleDto,
      user.id,
    );
  }

  @Delete('/:boardId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUserFromBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    return this.boardsService.removeUserFromBoard(boardId, userId, user.id);
  }

  @Get('/:boardId/users')
  getBoardUsers(@Param('boardId') boardId: string): Promise<BoardUser[]> {
    return this.boardsService.getBoardUsers(boardId);
  }
}
