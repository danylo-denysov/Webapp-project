import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface WebhookNotificationData {
  userId: string;
  userName: string;
  userEmail: string;
  notificationType: 'mention' | 'assignment';
  taskId: string;
  taskTitle: string;
  boardName: string;
  mentionedBy?: string;
  assignedBy?: string;
  commentContent?: string;
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly enabled: boolean;
  private readonly timeout: number;
  private readonly retryAttempts: number;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('ENABLE_WEBHOOK_NOTIFICATIONS', true);
    this.timeout = this.configService.get<number>('WEBHOOK_TIMEOUT', 5000);
    this.retryAttempts = this.configService.get<number>('WEBHOOK_RETRY_ATTEMPTS', 3);
  }

  async sendWebhook(webhookUrl: string, data: WebhookNotificationData): Promise<boolean> {
    if (!this.enabled) {
      this.logger.log('Webhook notifications are disabled');
      return false;
    }

    if (!webhookUrl) {
      this.logger.warn('Webhook URL is not set');
      return false;
    }

    // Detect webhook type and format payload accordingly
    const payload = this.isDiscordWebhook(webhookUrl)
      ? this.formatDiscordPayload(data)
      : this.formatGenericPayload(data);

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await axios.post(webhookUrl, payload, {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'TaskManagementApp-Webhook/1.0',
          },
        });

        this.logger.log(`Webhook sent successfully to ${webhookUrl} (attempt ${attempt})`);
        return true;
      } catch (error) {
        const axiosError = error as AxiosError;
        this.logger.error(
          `Failed to send webhook to ${webhookUrl} (attempt ${attempt}/${this.retryAttempts}):`,
          axiosError.message,
        );

        if (attempt === this.retryAttempts) {
          return false;
        }

        // Wait before retrying (exponential backoff)
        await this.delay(1000 * attempt);
      }
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isDiscordWebhook(webhookUrl: string): boolean {
    return webhookUrl.includes('discord.com/api/webhooks');
  }

  private formatDiscordPayload(data: WebhookNotificationData): any {
    let content = '';
    let embeds: any[] = [];

    if (data.notificationType === 'mention') {
      content = `🔔 **${data.userName}** was mentioned!`;
      embeds = [
        {
          title: '📝 Mention Notification',
          color: 0x667eea, // Purple color
          fields: [
            {
              name: 'Mentioned by',
              value: data.mentionedBy || 'Unknown',
              inline: true,
            },
            {
              name: 'Task',
              value: data.taskTitle,
              inline: true,
            },
            {
              name: 'Board',
              value: data.boardName,
              inline: true,
            },
            ...(data.commentContent
              ? [
                  {
                    name: 'Comment',
                    value:
                      data.commentContent.length > 1024
                        ? data.commentContent.substring(0, 1021) + '...'
                        : data.commentContent,
                    inline: false,
                  },
                ]
              : []),
          ],
          timestamp: data.timestamp,
          footer: {
            text: 'Task Management App',
          },
        },
      ];
    } else {
      content = `📌 **${data.userName}** was assigned to a task!`;
      embeds = [
        {
          title: '✅ Assignment Notification',
          color: 0x764ba2, // Purple-pink color
          fields: [
            {
              name: 'Assigned by',
              value: data.assignedBy || 'Unknown',
              inline: true,
            },
            {
              name: 'Task',
              value: data.taskTitle,
              inline: true,
            },
            {
              name: 'Board',
              value: data.boardName,
              inline: true,
            },
          ],
          timestamp: data.timestamp,
          footer: {
            text: 'Task Management App',
          },
        },
      ];
    }

    return {
      content,
      embeds,
      username: 'Task Management Bot',
    };
  }

  private formatGenericPayload(data: WebhookNotificationData): any {
    return {
      event:
        data.notificationType === 'mention'
          ? 'task.user_mentioned'
          : 'task.user_assigned',
      timestamp: data.timestamp,
      data: {
        user: {
          id: data.userId,
          name: data.userName,
          email: data.userEmail,
        },
        task: {
          id: data.taskId,
          title: data.taskTitle,
        },
        board: {
          name: data.boardName,
        },
        ...(data.mentionedBy && { mentioned_by: data.mentionedBy }),
        ...(data.assignedBy && { assigned_by: data.assignedBy }),
        ...(data.commentContent && { comment: data.commentContent }),
      },
    };
  }
}
