import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService, MentionNotificationEvent, AssignmentNotificationEvent } from './notifications.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserNotificationPreferences } from './user-notification-preferences.entity';
import { NotificationLog, NotificationType, NotificationChannel, NotificationStatus } from './notification-log.entity';
import { Task } from '../tasks/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { WebhookService } from './webhook.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let usersRepository: Repository<User>;
  let preferencesRepository: Repository<UserNotificationPreferences>;
  let notificationLogRepository: Repository<NotificationLog>;
  let tasksRepository: Repository<Task>;
  let emailService: EmailService;
  let webhookService: WebhookService;

  const mockUser: User = {
    id: 'user-uuid-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    created_at: new Date(),
    profile_picture: null,
    current_hashed_refresh_token: null,
    boards: [],
  };

  const mockMentionedByUser: User = {
    id: 'user-uuid-2',
    username: 'mentionuser',
    email: 'mention@example.com',
    password: 'hashedPassword',
    created_at: new Date(),
    profile_picture: null,
    current_hashed_refresh_token: null,
    boards: [],
  };

  const mockPreferences: UserNotificationPreferences = {
    id: 'pref-uuid-1',
    user: mockUser,
    emailOnMention: true,
    emailOnAssignment: true,
    webhookOnMention: false,
    webhookOnAssignment: false,
    webhookUrl: null,
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  const mockPreferencesRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationLogRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTasksRepository = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendNotificationEmail: jest.fn(),
  };

  const mockWebhookService = {
    sendWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(UserNotificationPreferences),
          useValue: mockPreferencesRepository,
        },
        {
          provide: getRepositoryToken(NotificationLog),
          useValue: mockNotificationLogRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    preferencesRepository = module.get<Repository<UserNotificationPreferences>>(
      getRepositoryToken(UserNotificationPreferences),
    );
    notificationLogRepository = module.get<Repository<NotificationLog>>(
      getRepositoryToken(NotificationLog),
    );
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    emailService = module.get<EmailService>(EmailService);
    webhookService = module.get<WebhookService>(WebhookService);

    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return user notification preferences', async () => {
      mockPreferencesRepository.findOne.mockResolvedValue(mockPreferences);

      const result = await service.getPreferences('user-uuid-1');

      expect(result).toEqual(mockPreferences);
      expect(mockPreferencesRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-uuid-1' } },
        relations: ['user'],
      });
    });

    it('should create default preferences if none exist', async () => {
      mockPreferencesRepository.findOne.mockResolvedValueOnce(null);
      mockUsersRepository.findOne.mockResolvedValueOnce(mockUser);
      mockPreferencesRepository.create.mockReturnValue(mockPreferences);
      mockPreferencesRepository.save.mockResolvedValueOnce(mockPreferences);

      const result = await service.getPreferences('user-uuid-1');

      expect(result).toEqual(mockPreferences);
      expect(mockPreferencesRepository.create).toHaveBeenCalled();
      expect(mockPreferencesRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    const updateDto = {
      emailOnMention: false,
      emailOnAssignment: true,
      webhookOnMention: true,
      webhookUrl: 'https://webhook.example.com',
    };

    it('should update user notification preferences', async () => {
      const updatedPreferences = {
        ...mockPreferences,
        ...updateDto,
      };

      mockPreferencesRepository.findOne.mockResolvedValue(mockPreferences);
      mockPreferencesRepository.save.mockResolvedValue(updatedPreferences);

      const result = await service.updatePreferences('user-uuid-1', updateDto);

      expect(result.emailOnMention).toBe(false);
      expect(result.webhookOnMention).toBe(true);
      expect(result.webhookUrl).toBe('https://webhook.example.com');
      expect(mockPreferencesRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications sorted by date', async () => {
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.MENTION,
          sent_at: new Date('2024-01-02'),
          relatedTaskId: 'task-uuid-1',
          content: 'Test notification',
        },
        {
          id: 'notif-2',
          type: NotificationType.ASSIGNMENT,
          sent_at: new Date('2024-01-01'),
          relatedTaskId: null,
          content: 'Another notification',
        },
      ];

      const mockTask = {
        id: 'task-uuid-1',
        title: 'Test Task',
        taskGroup: {
          id: 'group-uuid-1',
          board: {
            id: 'board-uuid-1',
            name: 'Test Board',
          },
        },
      };

      mockNotificationLogRepository.find.mockResolvedValue(notifications);
      mockTasksRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.getUserNotifications('user-uuid-1');

      expect(result).toBeDefined();
      expect(mockNotificationLogRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: 'user-uuid-1' },
          status: NotificationStatus.SENT,
        },
        relations: ['user'],
        order: { sent_at: 'DESC' },
        take: 50,
      });
    });
  });

  describe('handleMentionNotification', () => {
    const mentionEvent: MentionNotificationEvent = {
      mentionedUserId: 'user-uuid-1',
      mentionedByUserId: 'user-uuid-2',
      taskId: 'task-uuid-1',
      taskTitle: 'Test Task',
      boardId: 'board-uuid-1',
      boardName: 'Test Board',
      commentContent: 'Hey @testuser, check this out!',
    };


    it('should not send email when preference is disabled', async () => {
      const preferencesWithoutEmail = {
        ...mockPreferences,
        emailOnMention: false,
        user: mockUser,
      };

      mockUsersRepository.findOne.mockImplementation((options: any) => {
        const userId = options?.where?.id;
        if (userId === 'user-uuid-1') return Promise.resolve(mockUser);
        if (userId === 'user-uuid-2') return Promise.resolve(mockMentionedByUser);
        return Promise.resolve(null);
      });

      mockPreferencesRepository.findOne.mockResolvedValue(preferencesWithoutEmail);
      mockNotificationLogRepository.create.mockReturnValue({});
      mockNotificationLogRepository.save.mockResolvedValue({});

      await service.handleMentionNotification(mentionEvent);

      expect(mockEmailService.sendNotificationEmail).not.toHaveBeenCalled();
      expect(mockNotificationLogRepository.save).toHaveBeenCalled();
    });

    it('should handle missing users gracefully', async () => {
      mockUsersRepository.findOne.mockImplementation(() => Promise.resolve(null));

      await service.handleMentionNotification(mentionEvent);

      expect(mockEmailService.sendNotificationEmail).not.toHaveBeenCalled();
      expect(mockNotificationLogRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('handleAssignmentNotification', () => {
    const assignmentEvent: AssignmentNotificationEvent = {
      assignedUserId: 'user-uuid-1',
      assignedByUserId: 'user-uuid-2',
      taskId: 'task-uuid-1',
      taskTitle: 'Test Task',
      boardId: 'board-uuid-1',
      boardName: 'Test Board',
    };

    beforeEach(() => {
      // Reset user repository mock to prevent interference from previous tests
      mockUsersRepository.findOne.mockReset();
    });

    it('should send email notification when preference is enabled', async () => {
      mockUsersRepository.findOne.mockImplementation((options: any) => {
        const userId = options?.where?.id;
        if (userId === 'user-uuid-1') return Promise.resolve(mockUser);
        if (userId === 'user-uuid-2') return Promise.resolve(mockMentionedByUser);
        return Promise.resolve(null);
      });

      mockPreferencesRepository.findOne.mockResolvedValue({
        ...mockPreferences,
        user: mockUser,
      });
      mockNotificationLogRepository.create.mockReturnValue({});
      mockNotificationLogRepository.save.mockResolvedValue({});
      mockEmailService.sendNotificationEmail.mockResolvedValue(true);

      await service.handleAssignmentNotification(assignmentEvent);

      expect(mockEmailService.sendNotificationEmail).toHaveBeenCalledWith({
        recipientEmail: mockUser.email,
        recipientName: mockUser.username,
        subject: `You were assigned to "${assignmentEvent.taskTitle}"`,
        taskTitle: assignmentEvent.taskTitle,
        taskId: assignmentEvent.taskId,
        boardId: assignmentEvent.boardId,
        boardName: assignmentEvent.boardName,
        assignedBy: mockMentionedByUser.username,
        notificationType: 'assignment',
      });
      expect(mockNotificationLogRepository.save).toHaveBeenCalled();
    });

    it('should not send email when preference is disabled', async () => {
      const preferencesWithoutEmail = {
        ...mockPreferences,
        emailOnAssignment: false,
        user: mockUser,
      };

      mockUsersRepository.findOne.mockImplementation((options: any) => {
        const userId = options?.where?.id;
        if (userId === 'user-uuid-1') return Promise.resolve(mockUser);
        if (userId === 'user-uuid-2') return Promise.resolve(mockMentionedByUser);
        return Promise.resolve(null);
      });

      mockPreferencesRepository.findOne.mockResolvedValue(preferencesWithoutEmail);
      mockNotificationLogRepository.create.mockReturnValue({});
      mockNotificationLogRepository.save.mockResolvedValue({});

      await service.handleAssignmentNotification(assignmentEvent);

      expect(mockEmailService.sendNotificationEmail).not.toHaveBeenCalled();
      expect(mockNotificationLogRepository.save).toHaveBeenCalled();
    });
  });

  describe('logNotification', () => {
    it('should create and save notification log entry', async () => {
      const logData = {
        user: mockUser,
        type: NotificationType.MENTION,
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.SENT,
        relatedTaskId: 'task-uuid-1',
        content: 'Test notification',
      };

      const mockLogEntry = {
        ...logData,
        id: 'log-uuid-1',
        created_at: new Date(),
      };

      mockNotificationLogRepository.create.mockReturnValue(mockLogEntry);
      mockNotificationLogRepository.save.mockResolvedValue(mockLogEntry);

      await service['logNotification'](logData);

      expect(mockNotificationLogRepository.create).toHaveBeenCalled();
      expect(mockNotificationLogRepository.save).toHaveBeenCalledWith(mockLogEntry);
    });
  });
});
