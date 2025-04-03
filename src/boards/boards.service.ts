import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { User } from '../users/user.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardUser } from './board-user.entity';
import { BoardUserRole } from './board-user-role.enum';
import { UpdateBoardUserRoleDto } from './dto/update-board-user-role.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardsRepository: Repository<Board>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(BoardUser) private boardUsersRepository: Repository<BoardUser>,
  ) {}

  async get_user_boards(userId: string): Promise<Board[]> {
    const boards = await this.boardsRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
    return boards;
  }

  async create_board(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const { name } = createBoardDto;

    const board = this.boardsRepository.create({
      name,
      created_at: new Date(),
      owner: user,
    });

    await this.boardsRepository.save(board);
    return board;
  }

  async delete_board(boardId: string, userId: string): Promise<void> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId, owner: { id: userId } },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found or you don't have access to it`);
    }

    await this.boardsRepository.remove(board);
  }

  async get_board_by_id(boardId: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId, owner: { id: userId } },
      relations: ['taskGroups', 'taskGroups.tasks'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found or you don't have access to it`);
    }

    return board;
  }

  async add_user_to_board(boardId: string, userId: string, updateBoardUserRoleDto: UpdateBoardUserRoleDto): Promise<BoardUser> {
    const board = await this.boardsRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if the user is already assigned to the board
    const existingBoardUser = await this.boardUsersRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
    });
    if (existingBoardUser) {
      throw new BadRequestException(`User with ID "${userId}" is already assigned to the board`);
    }

    const { role } = updateBoardUserRoleDto;

    const boardUser = this.boardUsersRepository.create({
      board,
      user,
      role,
    });

    await this.boardUsersRepository.save(boardUser);
    return boardUser;
  }

  async remove_user_from_board(boardId: string, userId: string): Promise<void> {
    const result = await this.boardUsersRepository.delete({
      board: { id: boardId },
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" is not assigned to the board with ID "${boardId}"`);
    }
  }

  async get_board_users(boardId: string): Promise<BoardUser[]> {
    const board = await this.boardsRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    return this.boardUsersRepository.find({
      where: { board: { id: boardId } },
      relations: ['user'],
    });
  }
}
