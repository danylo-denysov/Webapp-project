import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskList } from './task-list.entity';
import { TaskListItem } from './task-list-item.entity';
import { TaskComment } from './task-comment.entity';
import { TaskGroup } from '../task-groups/task-group.entity';
import { User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentionsService } from './mentions.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepository: Repository<Task>;
  let taskListsRepository: Repository<TaskList>;
  let taskListItemsRepository: Repository<TaskListItem>;
  let taskCommentsRepository: Repository<TaskComment>;
  let groupRepository: Repository<TaskGroup>;
  let userRepository: Repository<User>;
  let mentionsService: MentionsService;
  let eventEmitter: EventEmitter2;

  const mockBoard = {
    id: 'board-uuid-1',
    name: 'Test Board',
  };

  const mockTaskGroup = {
    id: 'group-uuid-1',
    name: 'To Do',
    board: mockBoard,
  };

  const mockUser = {
    id: 'user-uuid-1',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockTask: Task = {
    id: 'task-uuid-1',
    title: 'Test Task',
    description: 'Test Description',
    order: 0,
    created_at: new Date(),
    taskGroup: mockTaskGroup as any,
    taskLists: [],
    comments: [],
    users: [],
    mentions: [],
  };

  const mockTasksRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTaskListsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTaskListItemsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTaskCommentsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockGroupRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockMentionsService = {
    extractMentions: jest.fn(),
    processMentionsInComment: jest.fn(),
    processMentionsInTask: jest.fn(),
    getUserMentions: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: getRepositoryToken(TaskList),
          useValue: mockTaskListsRepository,
        },
        {
          provide: getRepositoryToken(TaskListItem),
          useValue: mockTaskListItemsRepository,
        },
        {
          provide: getRepositoryToken(TaskComment),
          useValue: mockTaskCommentsRepository,
        },
        {
          provide: getRepositoryToken(TaskGroup),
          useValue: mockGroupRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: MentionsService,
          useValue: mockMentionsService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    taskListsRepository = module.get<Repository<TaskList>>(
      getRepositoryToken(TaskList),
    );
    taskListItemsRepository = module.get<Repository<TaskListItem>>(
      getRepositoryToken(TaskListItem),
    );
    taskCommentsRepository = module.get<Repository<TaskComment>>(
      getRepositoryToken(TaskComment),
    );
    groupRepository = module.get<Repository<TaskGroup>>(
      getRepositoryToken(TaskGroup),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    mentionsService = module.get<MentionsService>(MentionsService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTasks', () => {
    it('should return all tasks when no groupId provided', async () => {
      const tasks = [mockTask];
      mockTasksRepository.find.mockResolvedValue(tasks);

      const result = await service.getTasks();

      expect(result).toEqual(tasks);
      expect(mockTasksRepository.find).toHaveBeenCalledWith({
        order: { order: 'ASC' },
        relations: ['taskLists', 'taskLists.items', 'comments', 'users'],
      });
    });

    it('should return tasks for specific group', async () => {
      const tasks = [mockTask];
      mockTasksRepository.find.mockResolvedValue(tasks);

      const result = await service.getTasks('group-uuid-1');

      expect(result).toEqual(tasks);
      expect(mockTasksRepository.find).toHaveBeenCalledWith({
        where: { taskGroup: { id: 'group-uuid-1' } },
        order: { order: 'ASC' },
        relations: ['taskLists', 'taskLists.items', 'comments', 'users'],
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task with sorted lists and comments', async () => {
      const taskWithData = {
        ...mockTask,
        taskLists: [
          { id: '1', order: 2, items: [{ id: 'i2', order: 1 }, { id: 'i1', order: 0 }] },
          { id: '2', order: 0, items: [{ id: 'i3', order: 0 }] },
        ],
        comments: [
          { id: 'c1', created_at: new Date('2024-01-01') },
          { id: 'c2', created_at: new Date('2024-01-02') },
        ],
      };
      mockTasksRepository.findOne.mockResolvedValue(taskWithData);

      const result = await service.getTaskById('task-uuid-1');

      expect(result).toBeDefined();
      expect(result.taskLists[0].order).toBe(0);
      expect(result.taskLists[1].order).toBe(2);
      expect(result.taskLists[0].items[0].order).toBe(0);
      expect(result.taskLists[1].items[0].order).toBe(0); // First item after sorting
      expect(result.taskLists[1].items[1].order).toBe(1); // Second item after sorting
      expect(result.comments[0].id).toBe('c2'); // Newest first
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTaskById('invalid-id')).rejects.toThrow(
        'Task with ID "invalid-id" not found',
      );
    });
  });

  describe('getBoardIdFromGroupId', () => {
    it('should return board ID from group ID', async () => {
      mockGroupRepository.findOne.mockResolvedValue(mockTaskGroup);

      const result = await service.getBoardIdFromGroupId('group-uuid-1');

      expect(result).toBe('board-uuid-1');
      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'group-uuid-1' },
        relations: ['board'],
      });
    });

    it('should throw NotFoundException if group does not exist', async () => {
      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.getBoardIdFromGroupId('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getBoardIdFromTaskId', () => {
    it('should return board ID from task ID', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getBoardIdFromTaskId('task-uuid-1');

      expect(result).toBe('board-uuid-1');
      expect(mockTasksRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-uuid-1' },
        relations: ['taskGroup', 'taskGroup.board'],
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(service.getBoardIdFromTaskId('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    const createTaskDto = {
      title: 'New Task',
      description: 'New Description',
      groupId: 'group-uuid-1',
    };

    it('should successfully create a task', async () => {
      mockGroupRepository.findOne.mockResolvedValue(mockTaskGroup);

      // Mock query builder for order calculation
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 0 }),
      };
      mockTasksRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      mockTasksRepository.create.mockReturnValue(mockTask);
      mockTasksRepository.save.mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        title: createTaskDto.title,
        description: createTaskDto.description,
        taskGroup: mockTaskGroup,
        order: 1,
      });
      expect(mockTasksRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if group does not exist', async () => {
      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.createTask(createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTaskById', () => {
    it('should successfully delete a task', async () => {
      mockTasksRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTaskById('task-uuid-1');

      expect(mockTasksRepository.delete).toHaveBeenCalledWith('task-uuid-1');
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTasksRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTaskById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createComment', () => {
    const createCommentDto = {
      content: 'Test comment with @testuser mention',
    };

    it('should create comment and handle mentions', async () => {
      const comment = {
        id: 'comment-uuid-1',
        content: createCommentDto.content,
        created_at: new Date(),
        user: mockUser,
        task: mockTask,
      };

      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTaskCommentsRepository.create.mockReturnValue(comment);
      mockTaskCommentsRepository.save.mockResolvedValue(comment);
      mockMentionsService.processMentionsInComment.mockResolvedValue([mockUser]);

      const result = await service.createComment(
        createCommentDto,
        'task-uuid-1',
        'user-uuid-1',
      );

      expect(result).toEqual(comment);
      expect(mockMentionsService.processMentionsInComment).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('assignUserToTask', () => {
    it('should assign user to task', async () => {
      const taskWithUsers = { ...mockTask, users: [] };
      mockTasksRepository.findOne.mockResolvedValue(taskWithUsers);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTasksRepository.save.mockResolvedValue({
        ...taskWithUsers,
        users: [mockUser],
      });

      await service.assignUserToTask('task-uuid-1', 'user-uuid-1', 'assigner-uuid');

      expect(mockTasksRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'task.user_assigned',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTasksRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignUserToTask('invalid-id', 'user-uuid-1', 'assigner-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignUserToTask('task-uuid-1', 'invalid-user', 'assigner-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUserFromTask', () => {
    it('should remove user from task', async () => {
      const taskWithUsers = { ...mockTask, users: [mockUser] };
      mockTasksRepository.findOne.mockResolvedValue(taskWithUsers);
      mockTasksRepository.save.mockResolvedValue({
        ...taskWithUsers,
        users: [],
      });

      await service.removeUserFromTask('task-uuid-1', 'user-uuid-1');

      expect(mockTasksRepository.save).toHaveBeenCalledWith({
        ...taskWithUsers,
        users: [],
      });
    });
  });

  describe('isUserAssignedToTask', () => {
    it('should return true if user is assigned to task', async () => {
      const taskWithUsers = { ...mockTask, users: [mockUser] };
      mockTasksRepository.findOne.mockResolvedValue(taskWithUsers);

      const result = await service.isUserAssignedToTask(
        'task-uuid-1',
        'user-uuid-1',
      );

      expect(result).toBe(true);
    });

    it('should return false if user is not assigned to task', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.isUserAssignedToTask(
        'task-uuid-1',
        'user-uuid-1',
      );

      expect(result).toBe(false);
    });
  });
});
