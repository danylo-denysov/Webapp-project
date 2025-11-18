import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { User } from './user.entity';
import { UserNotificationPreferences } from './user-notification-preferences.entity';
import { NotificationLog, NotificationType, NotificationChannel, NotificationStatus } from './notification-log.entity';
import { EmailService } from './email.service';
import { WebhookService } from './webhook.service';
import { Task } from '../tasks/task.entity';

export interface MentionNotificationEvent {
  mentionedUserId: string;
  mentionedByUserId: string;
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardName: string;
  commentContent?: string;
}

export interface AssignmentNotificationEvent {
  assignedUserId: string;
  assignedByUserId: string;
  taskId: string;
  taskTitle: string;
  boardId: string;
  boardName: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserNotificationPreferences)
    private preferencesRepository: Repository<UserNotificationPreferences>,

    @InjectRepository(NotificationLog)
    private notificationLogRepository: Repository<NotificationLog>,

    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,

    private emailService: EmailService,
    private webhookService: WebhookService,
  ) {}

  @OnEvent('task.user_mentioned')
  async handleMentionNotification(event: MentionNotificationEvent) {
    this.logger.log(`Handling mention notification for user ${event.mentionedUserId}`);

    const mentionedUser = await this.usersRepository.findOne({
      where: { id: event.mentionedUserId },
    });

    const mentionedByUser = await this.usersRepository.findOne({
      where: { id: event.mentionedByUserId },
    });

    if (!mentionedUser || !mentionedByUser) {
      this.logger.error('User not found for mention notification');
      return;
    }

    const preferences = await this.getOrCreatePreferences(mentionedUser.id);
    const notificationContent = `${mentionedByUser.username} mentioned you`;

    // Always create a notification log entry for the notification tab
    await this.logNotification({
      user: mentionedUser,
      type: NotificationType.MENTION,
      channel: NotificationChannel.EMAIL, // Use email as default channel for tracking
      status: NotificationStatus.SENT,
      relatedTaskId: event.taskId,
      content: notificationContent,
    });

    // Send email notification
    if (preferences.emailOnMention) {
      const success = await this.emailService.sendNotificationEmail({
        recipientEmail: mentionedUser.email,
        recipientName: mentionedUser.username,
        subject: `You were mentioned in "${event.taskTitle}"`,
        taskTitle: event.taskTitle,
        taskId: event.taskId,
        boardId: event.boardId,
        boardName: event.boardName,
        mentionedBy: mentionedByUser.username,
        commentContent: event.commentContent,
        notificationType: 'mention',
      });

      this.logger.log(`Email notification ${success ? 'sent' : 'failed'} for mention to ${mentionedUser.email}`);
    }

    // Send webhook notification
    if (preferences.webhookOnMention && preferences.webhookUrl) {
      const success = await this.webhookService.sendWebhook(preferences.webhookUrl, {
        userId: mentionedUser.id,
        userName: mentionedUser.username,
        userEmail: mentionedUser.email,
        notificationType: 'mention',
        taskId: event.taskId,
        taskTitle: event.taskTitle,
        boardName: event.boardName,
        mentionedBy: mentionedByUser.username,
        commentContent: event.commentContent,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Webhook notification ${success ? 'sent' : 'failed'} for mention`);
    }
  }

  @OnEvent('task.user_assigned')
  async handleAssignmentNotification(event: AssignmentNotificationEvent) {
    this.logger.log(`Handling assignment notification for user ${event.assignedUserId}`);

    const assignedUser = await this.usersRepository.findOne({
      where: { id: event.assignedUserId },
    });

    const assignedByUser = await this.usersRepository.findOne({
      where: { id: event.assignedByUserId },
    });

    if (!assignedUser || !assignedByUser) {
      this.logger.error('User not found for assignment notification');
      return;
    }

    const preferences = await this.getOrCreatePreferences(assignedUser.id);
    const notificationContent = `${assignedByUser.username} assigned you to`;

    // Always create a notification log entry for the notification tab
    await this.logNotification({
      user: assignedUser,
      type: NotificationType.ASSIGNMENT,
      channel: NotificationChannel.EMAIL, // Use email as default channel for tracking
      status: NotificationStatus.SENT,
      relatedTaskId: event.taskId,
      content: notificationContent,
    });

    // Send email notification
    if (preferences.emailOnAssignment) {
      const success = await this.emailService.sendNotificationEmail({
        recipientEmail: assignedUser.email,
        recipientName: assignedUser.username,
        subject: `You were assigned to "${event.taskTitle}"`,
        taskTitle: event.taskTitle,
        taskId: event.taskId,
        boardId: event.boardId,
        boardName: event.boardName,
        assignedBy: assignedByUser.username,
        notificationType: 'assignment',
      });

      this.logger.log(`Email notification ${success ? 'sent' : 'failed'} for assignment to ${assignedUser.email}`);
    }

    // Send webhook notification
    if (preferences.webhookOnAssignment && preferences.webhookUrl) {
      const success = await this.webhookService.sendWebhook(preferences.webhookUrl, {
        userId: assignedUser.id,
        userName: assignedUser.username,
        userEmail: assignedUser.email,
        notificationType: 'assignment',
        taskId: event.taskId,
        taskTitle: event.taskTitle,
        boardName: event.boardName,
        assignedBy: assignedByUser.username,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Webhook notification ${success ? 'sent' : 'failed'} for assignment`);
    }
  }

  async getOrCreatePreferences(userId: string): Promise<UserNotificationPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!preferences) {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      preferences = this.preferencesRepository.create({
        user,
        emailOnMention: true,
        emailOnAssignment: true,
        webhookOnMention: false,
        webhookOnAssignment: false,
        webhookUrl: null,
      });

      preferences = await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>,
  ): Promise<UserNotificationPreferences> {
    const preferences = await this.getOrCreatePreferences(userId);

    Object.assign(preferences, updates);

    return this.preferencesRepository.save(preferences);
  }

  async getPreferences(userId: string): Promise<UserNotificationPreferences> {
    return this.getOrCreatePreferences(userId);
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    const logs = await this.notificationLogRepository.find({
      where: {
        user: { id: userId },
        status: NotificationStatus.SENT,
      },
      relations: ['user'],
      order: { sent_at: 'DESC' },
      take: 50,
    });

    // Fetch task information for each notification
    const notifications = await Promise.all(
      logs.map(async (log) => {
        if (!log.relatedTaskId) {
          return {
            id: log.id,
            type: log.type,
            content: log.content,
            sent_at: log.sent_at,
          };
        }

        const task = await this.tasksRepository.findOne({
          where: { id: log.relatedTaskId },
          relations: ['taskGroup', 'taskGroup.board'],
        });

        if (!task) {
          return {
            id: log.id,
            type: log.type,
            content: log.content,
            sent_at: log.sent_at,
          };
        }

        return {
          id: log.id,
          type: log.type,
          content: log.content,
          sent_at: log.sent_at,
          task: {
            id: task.id,
            title: task.title,
            taskGroup: {
              id: task.taskGroup.id,
              name: task.taskGroup.name,
              board: {
                id: task.taskGroup.board.id,
                name: task.taskGroup.board.name,
              },
            },
          },
        };
      }),
    );

    return notifications;
  }

  private async logNotification(data: {
    user: User;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    relatedTaskId: string;
    content: string;
    error?: string;
  }): Promise<void> {
    const log = this.notificationLogRepository.create({
      user: data.user,
      type: data.type,
      channel: data.channel,
      status: data.status,
      relatedTaskId: data.relatedTaskId,
      content: data.content,
      error: data.error || null,
    });

    await this.notificationLogRepository.save(log);
  }
}
