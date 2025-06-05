import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { User } from '../users/user.entity';
import { BoardUser } from './board-user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { createMockRepo } from '../../test/mock-repository';
import { PublisherService } from '../messaging/publisher.service';

describe('BoardsService', () => {
  let service: BoardsService;
  const boardRepo = createMockRepo<Board>();
  const userRepo = createMockRepo<User>();
  const boardUserRepo = createMockRepo<BoardUser>();
  const publisher = {
    publishBoardCreated: jest.fn(),
    publishBoardDeleted: jest.fn(),
    publishBoardRenamed: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: getRepositoryToken(Board), useValue: boardRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(BoardUser), useValue: boardUserRepo },
        { provide: PublisherService, useValue: publisher },
      ],
    }).compile();

    service = module.get(BoardsService);
    jest.clearAllMocks();
  });

  it('verifyOwner throws if not owner', async () => {
    boardRepo.findOne.mockResolvedValue({
      id: 'b1',
      name: 'Demo',
      owner: { id: 'other' },
    } as any);

    await expect(service.verifyOwner('b1', 'me')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('create_board throws if user missing', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(
      service.create_board({ name: 'A' }, 'no-user'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rename_board returns updated board', async () => {
    const board = { id: 'b1', name: 'Old', owner: { id: 'me' } } as any;
    boardRepo.findOne.mockResolvedValue(board);
    boardRepo.save.mockImplementation((x) => x);

    const result = await service.rename_board('b1', 'New', 'me');
    expect(result.name).toBe('New');
    expect(publisher.publishBoardRenamed).toHaveBeenCalledWith('b1', 'New');
  });

  it('delete_board -> NotFound when board missing', async () => {
    boardRepo.findOne.mockResolvedValue(null);
    await expect(service.delete_board('x', 'me')).rejects.toThrow(
      NotFoundException,
    );
  });
});
