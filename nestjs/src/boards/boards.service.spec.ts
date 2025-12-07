import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { User } from '../users/user.entity';
import { BoardUser } from './board-user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { BoardUserRole } from './board-user-role.enum';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardsRepository: Repository<Board>;
  let usersRepository: Repository<User>;
  let boardUsersRepository: Repository<BoardUser>;

  const mockUser: User = {
    id: 'user-uuid-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    created_at: new Date(),
    profile_picture: null,
    current_hashed_refresh_token: null,
    boardUsers: [],
    taskComments: [],
    taskMentions: [],
    assignedTasks: [],
    notificationPreferences: null,
    notifications: [],
  };

  const mockBoard: Board = {
    id: 'board-uuid-1',
    name: 'Test Board',
    color: '#3498db',
    created_at: new Date(),
    owner: mockUser,
    taskGroups: [],
    boardUsers: [],
  };

  const mockBoardsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    manager: {
      query: jest.fn(),
    },
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  const mockBoardUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(BoardUser),
          useValue: mockBoardUsersRepository,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    boardsRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    boardUsersRepository = module.get<Repository<BoardUser>>(
      getRepositoryToken(BoardUser),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBoard', () => {
    const createBoardDto = {
      name: 'New Board',
    };

    it('should successfully create a board', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockBoardsRepository.create.mockReturnValue(mockBoard);
      mockBoardsRepository.save.mockResolvedValue(mockBoard);

      const result = await service.createBoard(createBoardDto, mockUser.id);

      expect(result).toEqual(mockBoard);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockBoardsRepository.create).toHaveBeenCalledWith({
        name: createBoardDto.name,
        created_at: expect.any(Date),
        owner: mockUser,
      });
      expect(mockBoardsRepository.save).toHaveBeenCalledWith(mockBoard);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createBoard(createBoardDto, 'invalid-user-id'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createBoard(createBoardDto, 'invalid-user-id'),
      ).rejects.toThrow('User with ID "invalid-user-id" not found');
    });
  });

  describe('getUserBoards', () => {
    it('should return all boards (owned and shared)', async () => {
      const ownedBoards = [mockBoard];
      const sharedBoardUser = {
        board: {
          id: 'shared-board-uuid',
          name: 'Shared Board',
          owner: { id: 'other-user-id' },
        },
      };

      mockBoardsRepository.find.mockResolvedValue(ownedBoards);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([sharedBoardUser]),
      };
      mockBoardUsersRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUserBoards(mockUser.id);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(mockBoard);
      expect(result).toContainEqual(sharedBoardUser.board);
    });

    it('should return only unique boards', async () => {
      const duplicateBoard = mockBoard;

      mockBoardsRepository.find.mockResolvedValue([duplicateBoard]);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ board: duplicateBoard }]),
      };
      mockBoardUsersRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.getUserBoards(mockUser.id);

      expect(result).toHaveLength(1);
    });
  });

  describe('getBoardById', () => {
    it('should return board if user is owner', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);

      const result = await service.getBoardById(mockBoard.id, mockUser.id);

      expect(result).toEqual(mockBoard);
    });

    it('should return board if user has access via BoardUser', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      const boardWithOtherOwner = { ...mockBoard, owner: otherUser };

      mockBoardsRepository.findOne.mockResolvedValue(boardWithOtherOwner);
      mockBoardUsersRepository.findOne.mockResolvedValue({
        board: boardWithOtherOwner,
        user: mockUser,
        role: BoardUserRole.VIEWER,
      });

      const result = await service.getBoardById(mockBoard.id, mockUser.id);

      expect(result).toEqual(boardWithOtherOwner);
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getBoardById('invalid-board-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      const otherUser = { ...mockUser, id: 'other-user-id' };
      const boardWithOtherOwner = { ...mockBoard, owner: otherUser };

      mockBoardsRepository.findOne.mockResolvedValue(boardWithOtherOwner);
      mockBoardUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getBoardById(mockBoard.id, mockUser.id),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getBoardById(mockBoard.id, mockUser.id),
      ).rejects.toThrow('You do not have access to this board');
    });
  });

  describe('deleteBoard', () => {
    it('should successfully delete board if user is owner', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardsRepository.remove.mockResolvedValue(mockBoard);

      await service.deleteBoard(mockBoard.id, mockUser.id);

      expect(mockBoardsRepository.remove).toHaveBeenCalledWith(mockBoard);
    });

    it('should throw NotFoundException if board does not exist or user is not owner', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteBoard('invalid-board-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('renameBoard', () => {
    it('should successfully rename board', async () => {
      const updatedBoard = { ...mockBoard, name: 'Renamed Board' };
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardsRepository.save.mockResolvedValue(updatedBoard);

      const result = await service.renameBoard(
        mockBoard.id,
        'Renamed Board',
        mockUser.id,
      );

      expect(result.name).toBe('Renamed Board');
      expect(mockBoardsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.renameBoard('invalid-board-id', 'New Name', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBoardColor', () => {
    it('should successfully update board color', async () => {
      const updatedBoard = { ...mockBoard, color: '#e74c3c' };
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardsRepository.save.mockResolvedValue(updatedBoard);

      const result = await service.updateBoardColor(
        mockBoard.id,
        '#e74c3c',
        mockUser.id,
      );

      expect(result.color).toBe('#e74c3c');
      expect(mockBoardsRepository.save).toHaveBeenCalled();
    });
  });

  describe('addUserToBoard', () => {
    const otherUser = {
      id: 'other-user-uuid',
      username: 'otheruser',
      email: 'other@example.com',
    };

    const updateBoardUserRoleDto = {
      role: BoardUserRole.EDITOR,
    };

    it('should successfully add user to board', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockUsersRepository.findOne.mockResolvedValue(otherUser);
      mockBoardUsersRepository.findOne.mockResolvedValue(null);
      mockBoardUsersRepository.create.mockReturnValue({
        board: mockBoard,
        user: otherUser,
        role: BoardUserRole.EDITOR,
      });
      mockBoardUsersRepository.save.mockResolvedValue({
        board: mockBoard,
        user: otherUser,
        role: BoardUserRole.EDITOR,
      });

      const result = await service.addUserToBoard(
        mockBoard.id,
        otherUser.id,
        updateBoardUserRoleDto,
        mockUser.id,
      );

      expect(result.user).toEqual(otherUser);
      expect(result.role).toBe(BoardUserRole.EDITOR);
    });

    it('should throw UnauthorizedException if user is not owner', async () => {
      const otherOwner = { ...mockUser, id: 'other-owner-id' };
      const boardWithOtherOwner = { ...mockBoard, owner: otherOwner };

      mockBoardsRepository.findOne.mockResolvedValue(boardWithOtherOwner);

      await expect(
        service.addUserToBoard(
          mockBoard.id,
          otherUser.id,
          updateBoardUserRoleDto,
          mockUser.id,
        ),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.addUserToBoard(
          mockBoard.id,
          otherUser.id,
          updateBoardUserRoleDto,
          mockUser.id,
        ),
      ).rejects.toThrow('Only the owner of the board can add users');
    });

    it('should throw BadRequestException if user already assigned', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockUsersRepository.findOne.mockResolvedValue(otherUser);
      mockBoardUsersRepository.findOne.mockResolvedValue({
        board: mockBoard,
        user: otherUser,
        role: BoardUserRole.VIEWER,
      });

      await expect(
        service.addUserToBoard(
          mockBoard.id,
          otherUser.id,
          updateBoardUserRoleDto,
          mockUser.id,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeUserFromBoard', () => {
    const otherUserId = 'other-user-uuid';

    it('should successfully remove user from board', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardUsersRepository.delete.mockResolvedValue({ affected: 1 });
      mockBoardsRepository.manager.query.mockResolvedValue(undefined);

      await service.removeUserFromBoard(mockBoard.id, otherUserId, mockUser.id);

      expect(mockBoardUsersRepository.delete).toHaveBeenCalledWith({
        board: { id: mockBoard.id },
        user: { id: otherUserId },
      });
      expect(mockBoardsRepository.manager.query).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not owner', async () => {
      const otherOwner = { ...mockUser, id: 'other-owner-id' };
      const boardWithOtherOwner = { ...mockBoard, owner: otherOwner };

      mockBoardsRepository.findOne.mockResolvedValue(boardWithOtherOwner);

      await expect(
        service.removeUserFromBoard(mockBoard.id, otherUserId, mockUser.id),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user is not assigned to board', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardUsersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.removeUserFromBoard(mockBoard.id, otherUserId, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBoardUsers', () => {
    it('should return all board users including owner', async () => {
      const boardUser = {
        id: 'board-user-1',
        user: { id: 'user-2', username: 'user2' },
        board: mockBoard,
        role: BoardUserRole.EDITOR,
      };

      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);
      mockBoardUsersRepository.find.mockResolvedValue([boardUser]);
      mockBoardUsersRepository.create.mockReturnValue({
        id: `owner-${mockBoard.owner.id}`,
        user: mockBoard.owner,
        board: mockBoard,
        role: 'Owner' as any,
      });

      const result = await service.getBoardUsers(mockBoard.id);

      expect(result).toHaveLength(2);
      expect(result[0].user).toEqual(mockBoard.owner);
      expect(result[1]).toEqual(boardUser);
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(null);

      await expect(service.getBoardUsers('invalid-board-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('verifyOwner', () => {
    it('should return board if user is owner', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);

      const result = await service.verifyOwner(mockBoard.id, mockUser.id);

      expect(result).toEqual(mockBoard);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(mockBoard);

      await expect(
        service.verifyOwner(mockBoard.id, 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.verifyOwner(mockBoard.id, 'other-user-id'),
      ).rejects.toThrow('You are not the owner of this board');
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.verifyOwner('invalid-board-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
