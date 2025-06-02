import { Controller, Get, Post, Delete, Param, Body, UseGuards, Patch } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardUser } from './board-user.entity';
import { UpdateBoardUserRoleDto } from './dto/update-board-user-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { GetUser } from 'src/users/get-user.decorator';
import { RenameBoardDto } from './dto/rename-board.dto';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('/user')
  async getUserBoards(@GetUser() user: User): Promise<Board[]> {
    const userId = user.id;
    return this.boardsService.get_user_boards(userId);
  }

  @Post('/user')
  async createBoard(
    @GetUser() user: User,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.create_board(createBoardDto, user.id);
  }

  @Delete('/:boardId/user')
  async deleteBoard(
    @Param('boardId') boardId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.delete_board(boardId, user.id);
  }

  @Get('/:boardId/user')
  async getBoardById(
    @Param('boardId') boardId: string,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.get_board_by_id(boardId, user.id);
  }

  @Patch('/:boardId/user')
  async renameBoard(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: RenameBoardDto,
    @GetUser() user: User,
  ): Promise<Board> {
    return this.boardsService.rename_board(boardId, updateBoardDto.name, user.id);
  }

  @Post('/:boardId/users/:userId')
  async addUserToBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    @GetUser() user: User,
  ): Promise<BoardUser> {
    return this.boardsService.add_user_to_board(boardId, userId, updateBoardUserRoleDto, user.id);
  }

  @Delete('/:boardId/users/:userId')
  async removeUserFromBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.boardsService.remove_user_from_board(boardId, userId, user.id);
  }

  @Get('/:boardId/users')
  async getBoardUsers(@Param('boardId') boardId: string): Promise<BoardUser[]> {
    return this.boardsService.get_board_users(boardId);
  }
}
