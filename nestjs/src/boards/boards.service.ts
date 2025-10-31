import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { User } from '../users/user.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardUser } from './board-user.entity';
import { UpdateBoardUserRoleDto } from './dto/update-board-user-role.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardsRepository: Repository<Board>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(BoardUser) private boardUsersRepository: Repository<BoardUser>,
  ) {}

  async verifyOwner(boardId: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    if (board.owner.id !== userId) {
      throw new ForbiddenException('You are not the owner of this board');
    }

    return board;
  }

  async getUserBoards(userId: string): Promise<Board[]> {
    const ownedBoards = await this.boardsRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });

    const sharedBoards = await this.boardUsersRepository
      .createQueryBuilder('bu')
      .leftJoinAndSelect('bu.board', 'board')
      .leftJoinAndSelect('board.owner', 'owner')
      .where('bu.userId = :userId', { userId })
      .getMany();

    const sharedBoardEntities = sharedBoards.map((bu) => bu.board);

    const allBoards = [...ownedBoards, ...sharedBoardEntities];
    const uniqueBoards = Array.from(
      new Map(allBoards.map((board) => [board.id, board])).values(),
    );

    return uniqueBoards;
  }

  async createBoard(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
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

  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId, owner: { id: userId } },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found or you don't have access to it`);
    }

    await this.boardsRepository.remove(board);
  }

  async getBoardById(boardId: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner', 'taskGroups', 'taskGroups.tasks'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    // Check if user is owner or has access via BoardUser
    const isOwner = board.owner.id === userId;
    if (!isOwner) {
      const boardUser = await this.boardUsersRepository.findOne({
        where: { board: { id: boardId }, user: { id: userId } },
      });
      if (!boardUser) {
        throw new ForbiddenException('You do not have access to this board');
      }
    }

    return board;
  }

  async renameBoard(boardId: string, newName: string, ownerId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId, owner: { id: ownerId } },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found or you don't have access`);
    }
    board.name = newName;
    await this.boardsRepository.save(board);
    return board;
  }

  async updateBoardColor(boardId: string, color: string, ownerId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId, owner: { id: ownerId } },
      relations: ['owner'],
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found or you don't have access`);
    }
    board.color = color;
    await this.boardsRepository.save(board);
    return board;
  }

  async addUserToBoard(
    boardId: string,
    userId: string,
    updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    ownerId: string, // Pass the authenticated user's ID
  ): Promise<BoardUser> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    // Check if the authenticated user is the owner of the board
    if (board.owner.id !== ownerId) {
      throw new UnauthorizedException('Only the owner of the board can add users');
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

    const boardUser = this.boardUsersRepository.create({
      board,
      user,
      role: updateBoardUserRoleDto.role,
    });

    await this.boardUsersRepository.save(boardUser);
    return boardUser;
  }

  async updateUserRole(
    boardId: string,
    userId: string,
    updateBoardUserRoleDto: UpdateBoardUserRoleDto,
    ownerId: string,
  ): Promise<BoardUser> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    if (board.owner.id !== ownerId) {
      throw new UnauthorizedException('Only the owner of the board can update user roles');
    }

    const boardUser = await this.boardUsersRepository.findOne({
      where: { board: { id: boardId }, user: { id: userId } },
      relations: ['user', 'board'],
    });

    if (!boardUser) {
      throw new NotFoundException(`User with ID "${userId}" is not assigned to the board`);
    }

    boardUser.role = updateBoardUserRoleDto.role;
    await this.boardUsersRepository.save(boardUser);

    return boardUser;
  }

  async removeUserFromBoard(boardId: string, userId: string, ownerId: string): Promise<void> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    // Check if the authenticated user is the owner of the board
    if (board.owner.id !== ownerId) {
      throw new UnauthorizedException('Only the owner of the board can remove users');
    }

    const result = await this.boardUsersRepository.delete({
      board: { id: boardId },
      user: { id: userId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${userId}" is not assigned to the board with ID "${boardId}"`);
    }
  }

  async getBoardUsers(boardId: string): Promise<BoardUser[]> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner']
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    const boardUsers = await this.boardUsersRepository.find({
      where: { board: { id: boardId } },
      relations: ['user'],
    });

    // Create a virtual BoardUser for the owner with role "Owner"
    const ownerBoardUser = this.boardUsersRepository.create({
      id: `owner-${board.owner.id}`, // Unique ID to distinguish from real BoardUser entries
      user: board.owner,
      board: board,
      role: 'Owner' as any, // Cast to any to avoid TypeScript issues with enum
    });

    // Add owner at the beginning of the list
    return [ownerBoardUser, ...boardUsers];
  }

  // Helper
  async findBoardWithOwner(boardId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }
    return board;
  }
}
