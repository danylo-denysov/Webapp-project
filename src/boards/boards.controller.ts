import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardUserRole } from './board-user-role.enum';
import { BoardUser } from './board-user.entity';
import { UpdateBoardUserRoleDto } from './dto/update-board-user-role.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('/user/:userId')
  async getUserBoards(@Param('userId') userId: string): Promise<Board[]> {
    return this.boardsService.get_user_boards(userId);
  }

  @Post('/user/:userId')
  async createBoard(
    @Param('userId') userId: string,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.create_board(createBoardDto, userId);
  }

  @Delete('/:boardId/user/:userId')
  async deleteBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.boardsService.delete_board(boardId, userId);
  }

  @Get('/:boardId/user/:userId')
  async getBoardById(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ): Promise<Board> {
    return this.boardsService.get_board_by_id(boardId, userId);
  }

  @Post('/:boardId/users/:userId')
  async addUserToBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
    @Body() updateBoardUserRoleDto: UpdateBoardUserRoleDto,
  ): Promise<BoardUser> {
    return this.boardsService.add_user_to_board(boardId, userId, updateBoardUserRoleDto);
  }

  @Delete('/:boardId/users/:userId')
  async removeUserFromBoard(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.boardsService.remove_user_from_board(boardId, userId);
  }

  @Get('/:boardId/users')
  async getBoardUsers(@Param('boardId') boardId: string): Promise<BoardUser[]> {
    return this.boardsService.get_board_users(boardId);
  }
}
