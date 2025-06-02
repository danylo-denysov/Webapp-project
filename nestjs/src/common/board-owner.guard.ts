// src/common/guards/board-owner.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BoardsService } from '../boards/boards.service';

@Injectable()
export class BoardOwnerGuard implements CanActivate {
  constructor(private readonly boardsService: BoardsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const boardId = req.params.boardId;

    if (!user || !user.id) {
      throw new ForbiddenException('Not authenticated');
    }
    if (!boardId) {
      throw new ForbiddenException('Board ID missing in request');
    }

    let board;
    try {
      board = await this.boardsService.findBoardWithOwner(boardId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new ForbiddenException('Unable to verify ownership');
    }

    if (board.owner.id !== user.id) {
      throw new ForbiddenException('You do not have permission to access this board');
    }

    return true;
  }
}
