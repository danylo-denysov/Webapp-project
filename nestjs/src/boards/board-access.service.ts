import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { BoardUser } from './board-user.entity';
import { BoardUserRole } from './board-user-role.enum';

export interface BoardAccessResult {
  board: Board;
  role: BoardUserRole;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

@Injectable()
export class BoardAccessService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(BoardUser)
    private boardUsersRepository: Repository<BoardUser>,
  ) {}

  async getBoardAccess(boardId: string, userId: string): Promise<BoardAccessResult> {
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
      relations: ['owner'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found`);
    }

    const isOwner = board.owner.id === userId;

    if (isOwner) {
      return {
        board,
        role: BoardUserRole.OWNER,
        isOwner: true,
        canRead: true,
        canWrite: true,
        canDelete: true,
      };
    }

    const boardUser = await this.boardUsersRepository.findOne({
      where: {
        board: { id: boardId },
        user: { id: userId },
      },
    });

    if (!boardUser) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return {
      board,
      role: boardUser.role,
      isOwner: false,
      canRead: true,
      canWrite: boardUser.role === BoardUserRole.EDITOR,
      canDelete: false,
    };
  }

  async requireAccess(
    boardId: string,
    userId: string,
    minRole: 'read' | 'write' | 'delete' = 'read',
  ): Promise<BoardAccessResult> {
    const access = await this.getBoardAccess(boardId, userId);

    switch (minRole) {
      case 'delete':
        if (!access.canDelete) {
          throw new ForbiddenException('Only the board owner can perform this action');
        }
        break;
      case 'write':
        if (!access.canWrite) {
          throw new ForbiddenException('You need Editor or Owner role to perform this action');
        }
        break;
      case 'read':
        if (!access.canRead) {
          throw new ForbiddenException('You do not have access to this board');
        }
        break;
    }

    return access;
  }

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

  async verifyWriteAccess(boardId: string, userId: string): Promise<Board> {
    const access = await this.requireAccess(boardId, userId, 'write');
    return access.board;
  }

  async verifyReadAccess(boardId: string, userId: string): Promise<Board> {
    const access = await this.requireAccess(boardId, userId, 'read');
    return access.board;
  }

  async hasWriteAccess(boardId: string, userId: string): Promise<boolean> {
    try {
      const access = await this.getBoardAccess(boardId, userId);
      return access.canWrite;
    } catch (error) {
      return false;
    }
  }

  async isBoardMember(boardId: string, userId: string): Promise<boolean> {
    try {
      await this.getBoardAccess(boardId, userId);
      return true;
    } catch (error) {
      return false;
    }
  }
}
