import { Test, TestingModule } from '@nestjs/testing';
import { MentionsService } from './mentions.service';
import { Repository } from 'typeorm';
import { TaskMention } from './task-mention.entity';
import { User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MentionsService', () => {
  let service: MentionsService;
  let mentionsRepository: Repository<TaskMention>;
  let usersRepository: Repository<User>;

  const mockUser1 = {
    id: 'user-uuid-1',
    username: 'john',
    email: 'john@example.com',
  };

  const mockUser2 = {
    id: 'user-uuid-2',
    username: 'jane',
    email: 'jane@example.com',
  };

  const mockMention: TaskMention = {
    id: 'mention-uuid-1',
    mentionedUser: mockUser1 as User,
    mentionedBy: mockUser2 as User,
    task: { id: 'task-uuid-1' } as any,
    comment: null,
    mentionType: 'task_description',
    created_at: new Date(),
  };

  const mockMentionsRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUsersRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentionsService,
        {
          provide: getRepositoryToken(TaskMention),
          useValue: mockMentionsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<MentionsService>(MentionsService);
    mentionsRepository = module.get<Repository<TaskMention>>(
      getRepositoryToken(TaskMention),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractMentions', () => {
    it('should extract usernames from text', () => {
      const text = 'Hey @john, can you review this with @jane?';
      const result = service.extractMentions(text);

      expect(result).toEqual(['john', 'jane']);
    });

    it('should handle multiple mentions of same user', () => {
      const text = 'Hey @john, @john please check this';
      const result = service.extractMentions(text);

      expect(result).toEqual(['john']); // Should remove duplicates
    });

    it('should return empty array if no mentions', () => {
      const text = 'Just a regular comment';
      const result = service.extractMentions(text);

      expect(result).toEqual([]);
    });

    it('should handle mentions with underscores and numbers', () => {
      const text = 'Mention @user_123 and @test_user';
      const result = service.extractMentions(text);

      expect(result).toEqual(['user_123', 'test_user']);
    });

    it('should handle mentions at start and end of text', () => {
      const text = '@john this is important @jane';
      const result = service.extractMentions(text);

      expect(result).toEqual(['john', 'jane']);
    });
  });

  describe('processMentionsInTask', () => {
    const taskId = 'task-uuid-1';
    const content = 'Please review this @john and @jane';
    const mentionedByUserId = 'user-uuid-3';
    const boardId = 'board-uuid-1';

    it('should process mentions in task description', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser1, mockUser2]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMentionsRepository.delete.mockResolvedValue({ affected: 1 });
      mockMentionsRepository.create.mockImplementation((data) => data);
      mockMentionsRepository.save.mockResolvedValue([mockMention]);

      const result = await service.processMentionsInTask(
        taskId,
        content,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([mockUser1, mockUser2]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username IN (:...usernames)',
        { usernames: ['john', 'jane'] },
      );
      expect(mockMentionsRepository.delete).toHaveBeenCalledWith({
        task: { id: taskId },
        mentionType: 'task_description',
      });
      expect(mockMentionsRepository.save).toHaveBeenCalled();
    });

    it('should return empty array if no mentions found', async () => {
      const contentWithoutMentions = 'Just a regular task description';

      const result = await service.processMentionsInTask(
        taskId,
        contentWithoutMentions,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([]);
      expect(mockUsersRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should only mention users with board access', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser1]), // Only user1 has access
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMentionsRepository.delete.mockResolvedValue({ affected: 0 });
      mockMentionsRepository.create.mockImplementation((data) => data);
      mockMentionsRepository.save.mockResolvedValue([mockMention]);

      const result = await service.processMentionsInTask(
        taskId,
        content,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([mockUser1]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(bu.boardId = :boardId OR b.ownerId = user.id)',
        { boardId },
      );
    });

    it('should delete old task mentions before creating new ones', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser1]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMentionsRepository.delete.mockResolvedValue({ affected: 2 });
      mockMentionsRepository.create.mockImplementation((data) => data);
      mockMentionsRepository.save.mockResolvedValue([mockMention]);

      await service.processMentionsInTask(
        taskId,
        content,
        mentionedByUserId,
        boardId,
      );

      expect(mockMentionsRepository.delete).toHaveBeenCalled();
      expect(mockMentionsRepository.save).toHaveBeenCalled();
    });
  });

  describe('processMentionsInComment', () => {
    const commentId = 'comment-uuid-1';
    const content = 'Great work @john!';
    const mentionedByUserId = 'user-uuid-3';
    const boardId = 'board-uuid-1';

    it('should process mentions in comment', async () => {
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser1]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMentionsRepository.create.mockImplementation((data) => data);
      mockMentionsRepository.save.mockResolvedValue([
        {
          ...mockMention,
          comment: { id: commentId },
          mentionType: 'comment',
        },
      ]);

      const result = await service.processMentionsInComment(
        commentId,
        content,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([mockUser1]);
      expect(mockMentionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mentionedUser: mockUser1,
          mentionedBy: { id: mentionedByUserId },
          task: null,
          comment: { id: commentId },
          mentionType: 'comment',
        }),
      );
      expect(mockMentionsRepository.save).toHaveBeenCalled();
    });

    it('should return empty array if no mentions in comment', async () => {
      const contentWithoutMentions = 'Great work!';

      const result = await service.processMentionsInComment(
        commentId,
        contentWithoutMentions,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([]);
      expect(mockUsersRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should handle multiple mentions in comment', async () => {
      const contentWithMultipleMentions = 'Thanks @john and @jane for the help!';

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser1, mockUser2]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMentionsRepository.create.mockImplementation((data) => data);
      mockMentionsRepository.save.mockResolvedValue([mockMention]);

      const result = await service.processMentionsInComment(
        commentId,
        contentWithMultipleMentions,
        mentionedByUserId,
        boardId,
      );

      expect(result).toEqual([mockUser1, mockUser2]);
      expect(mockMentionsRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserMentions', () => {
    it('should return all mentions for a user', async () => {
      const mentions = [
        mockMention,
        {
          ...mockMention,
          id: 'mention-uuid-2',
          mentionType: 'comment',
          comment: { id: 'comment-uuid-1' },
        },
      ];

      mockMentionsRepository.find.mockResolvedValue(mentions);

      const result = await service.getUserMentions('user-uuid-1');

      expect(result).toEqual(mentions);
      expect(mockMentionsRepository.find).toHaveBeenCalledWith({
        where: { mentionedUser: { id: 'user-uuid-1' } },
        relations: [
          'task',
          'task.taskGroup',
          'task.taskGroup.board',
          'comment',
          'comment.task',
          'comment.task.taskGroup',
          'comment.task.taskGroup.board',
          'mentionedBy',
        ],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array if user has no mentions', async () => {
      mockMentionsRepository.find.mockResolvedValue([]);

      const result = await service.getUserMentions('user-uuid-1');

      expect(result).toEqual([]);
    });

    it('should return mentions sorted by creation date descending', async () => {
      const mention1 = {
        ...mockMention,
        id: 'mention-1',
        created_at: new Date('2024-01-01'),
      };
      const mention2 = {
        ...mockMention,
        id: 'mention-2',
        created_at: new Date('2024-01-02'),
      };

      mockMentionsRepository.find.mockResolvedValue([mention2, mention1]);

      const result = await service.getUserMentions('user-uuid-1');

      expect(mockMentionsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { created_at: 'DESC' },
        }),
      );
    });
  });
});
