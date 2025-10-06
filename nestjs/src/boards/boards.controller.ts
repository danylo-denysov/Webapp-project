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
    return this.boardsService.get_user_boards(user.id);
  }

  @Post('/user')
  createBoard(
    @GetUser() user: JwtUserPayload,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    return this.boardsService.create_board(createBoardDto, user.id);
  }

  @Delete('/:boardId/user')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBoard(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    return this.boardsService.delete_board(boardId, user.id);
  }

  @Get('/:boardId/user')
  getBoardById(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<Board> {
    return this.boardsService.get_board_by_id(boardId, user.id);
  }

  @Patch('/:boardId/user')
  renameBoard(
    @Param('boardId') boardId: string,
    @Body() renameBoardDto: RenameBoardDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<Board> {
    return this.boardsService.rename_board(
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
    return this.boardsService.add_user_to_board(
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
    return this.boardsService.remove_user_from_board(boardId, userId, user.id);
  }

  @Get('/:boardId/users')
  getBoardUsers(@Param('boardId') boardId: string): Promise<BoardUser[]> {
    return this.boardsService.get_board_users(boardId);
  }
}
