import { Test, TestingModule } from '@nestjs/testing';
import { TaskGroupsService } from './task-groups.service';
import { Repository, DataSource } from 'typeorm';
import { TaskGroup } from './task-group.entity';
import { Board } from '../boards/board.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TaskGroupsService', () => {
  let service: TaskGroupsService;
  let groupsRepository: Repository<TaskGroup>;
  let boardsRepository: Repository<Board>;
  let dataSource: DataSource;

  const mockBoard = {
    id: 'board-uuid-1',
    name: 'Test Board',
    color: '#3498db',
    created_at: new Date(),
  };

  const mockTaskGroup: TaskGroup = {
    id: 'group-uuid-1',
    name: 'To Do',
    order: 0,
    board: mockBoard as Board,
    tasks: [],
  };

  const mockGroupsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBoardsRepository = {
    findOneBy: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskGroupsService,
        {
          provide: getRepositoryToken(TaskGroup),
          useValue: mockGroupsRepository,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardsRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TaskGroupsService>(TaskGroupsService);
    groupsRepository = module.get<Repository<TaskGroup>>(
      getRepositoryToken(TaskGroup),
    );
    boardsRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    dataSource = module.get<DataSource>(DataSource);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTaskGroups', () => {
    it('should return task groups for a board with sorted tasks', async () => {
      const groups = [mockTaskGroup];

      mockBoardsRepository.findOneBy.mockResolvedValue(mockBoard);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(groups),
      };
      mockGroupsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTaskGroups('board-uuid-1');

      expect(result).toEqual(groups);
      expect(mockBoardsRepository.findOneBy).toHaveBeenCalledWith({
        id: 'board-uuid-1',
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('g.boardId = :boardId', {
        boardId: 'board-uuid-1',
      });
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getTaskGroups('invalid-board-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTaskGroups('invalid-board-id')).rejects.toThrow(
        'Board with ID "invalid-board-id" not found',
      );
    });
  });

  describe('getTaskGroupById', () => {
    it('should return a task group by ID', async () => {
      mockGroupsRepository.findOne.mockResolvedValue(mockTaskGroup);

      const result = await service.getTaskGroupById('group-uuid-1');

      expect(result).toEqual(mockTaskGroup);
      expect(mockGroupsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'group-uuid-1' },
        relations: ['tasks'],
      });
    });

    it('should throw NotFoundException if group does not exist', async () => {
      mockGroupsRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaskGroupById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTaskGroupById('invalid-id')).rejects.toThrow(
        'TaskGroup with ID "invalid-id" not found',
      );
    });
  });

  describe('createTaskGroup', () => {
    const createDto = {
      name: 'In Progress',
    };

    it('should create a task group with auto-calculated order', async () => {
      const newGroup = { ...mockTaskGroup, name: 'In Progress', order: 1 };

      mockBoardsRepository.findOneBy.mockResolvedValue(mockBoard);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
      };
      mockGroupsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockGroupsRepository.create.mockReturnValue(newGroup);
      mockGroupsRepository.save.mockResolvedValue(newGroup);

      const result = await service.createTaskGroup('board-uuid-1', createDto);

      expect(result).toEqual(newGroup);
      expect(mockGroupsRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        board: mockBoard,
        order: 1,
      });
    });

    it('should create a task group with explicit order', async () => {
      const createDtoWithOrder = { ...createDto, order: 5 };
      const newGroup = { ...mockTaskGroup, name: 'In Progress', order: 5 };

      mockBoardsRepository.findOneBy.mockResolvedValue(mockBoard);
      mockGroupsRepository.create.mockReturnValue(newGroup);
      mockGroupsRepository.save.mockResolvedValue(newGroup);

      const result = await service.createTaskGroup('board-uuid-1', createDtoWithOrder);

      expect(result.order).toBe(5);
      expect(mockGroupsRepository.create).toHaveBeenCalledWith({
        name: createDtoWithOrder.name,
        board: mockBoard,
        order: 5,
      });
    });

    it('should throw NotFoundException if board does not exist', async () => {
      mockBoardsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.createTaskGroup('invalid-board-id', createDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createTaskGroup('invalid-board-id', createDto),
      ).rejects.toThrow('Board with ID "invalid-board-id" not found');
    });
  });

  describe('updateTaskGroup', () => {
    const updateDto = {
      name: 'Done',
    };

    it('should update a task group name', async () => {
      const updatedGroup = { ...mockTaskGroup, name: 'Done' };

      mockGroupsRepository.findOne.mockResolvedValue(mockTaskGroup);
      mockGroupsRepository.save.mockResolvedValue(updatedGroup);

      const result = await service.updateTaskGroup(
        'board-uuid-1',
        'group-uuid-1',
        updateDto,
      );

      expect(result.name).toBe('Done');
      expect(mockGroupsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group does not exist', async () => {
      mockGroupsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTaskGroup('board-uuid-1', 'invalid-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTaskGroup', () => {
    it('should successfully delete a task group', async () => {
      mockGroupsRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTaskGroup('board-uuid-1', 'group-uuid-1');

      expect(mockGroupsRepository.delete).toHaveBeenCalledWith({
        id: 'group-uuid-1',
        board: { id: 'board-uuid-1' },
      });
    });

    it('should throw NotFoundException if group does not exist', async () => {
      mockGroupsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(
        service.deleteTaskGroup('board-uuid-1', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteTaskGroup('board-uuid-1', 'invalid-id'),
      ).rejects.toThrow('TaskGroup with ID "invalid-id" not found');
    });
  });

  describe('reorderTaskGroups', () => {
    it('should reorder task groups', async () => {
      const groupIds = ['group-1', 'group-2', 'group-3'];
      const existingGroups = [
        { id: 'group-1' },
        { id: 'group-2' },
        { id: 'group-3' },
      ];

      mockGroupsRepository.find.mockResolvedValue(existingGroups);

      const mockManager = {
        update: jest.fn().mockResolvedValue(undefined),
      };
      mockDataSource.transaction.mockImplementation(async (callback) => {
        return callback(mockManager);
      });

      await service.reorderTaskGroups('board-uuid-1', groupIds);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalledTimes(3);
      expect(mockManager.update).toHaveBeenNthCalledWith(
        1,
        TaskGroup,
        { id: 'group-1' },
        { order: 0 },
      );
      expect(mockManager.update).toHaveBeenNthCalledWith(
        2,
        TaskGroup,
        { id: 'group-2' },
        { order: 1 },
      );
      expect(mockManager.update).toHaveBeenNthCalledWith(
        3,
        TaskGroup,
        { id: 'group-3' },
        { order: 2 },
      );
    });

    it('should throw NotFoundException if one or more groups not found', async () => {
      const groupIds = ['group-1', 'invalid-group'];
      const existingGroups = [{ id: 'group-1' }];

      mockGroupsRepository.find.mockResolvedValue(existingGroups);

      await expect(
        service.reorderTaskGroups('board-uuid-1', groupIds),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.reorderTaskGroups('board-uuid-1', groupIds),
      ).rejects.toThrow('One or more groups not found in this board');
    });
  });
});
