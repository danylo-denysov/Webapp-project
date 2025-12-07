import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailNotificationData {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  taskTitle: string;
  taskId: string;
  boardId: string;
  boardName: string;
  mentionedBy?: string;
  assignedBy?: string;
  commentContent?: string;
  notificationType: 'mention' | 'assignment';
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    // Disable emails in test environment or if DISABLE_EMAILS is set
    const disableEmails = process.env.DISABLE_EMAILS === 'true' || process.env.NODE_ENV === 'test';
    this.enabled = !disableEmails && this.configService.get<boolean>('ENABLE_EMAIL_NOTIFICATIONS', true);

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_SECURE', true),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
        },
      });
    } else {
      this.logger.log('Email service disabled (test environment or DISABLE_EMAILS=true)');
    }
  }

  async sendNotificationEmail(data: EmailNotificationData): Promise<boolean> {
    if (!this.enabled) {
      this.logger.log('Email notifications are disabled');
      return false;
    }

    try {
      const htmlContent = this.buildEmailHtml(data);
      const textContent = this.buildEmailText(data);

      await this.transporter.sendMail({
        from: {
          name: this.configService.get<string>('SMTP_FROM_NAME', 'Task Management App'),
          address: this.configService.get<string>('SMTP_FROM_EMAIL', 'noreply@task-app.com'),
        },
        to: data.recipientEmail,
        subject: data.subject,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Email sent successfully to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.recipientEmail}:`, error);
      return false;
    }
  }

  private buildEmailHtml(data: EmailNotificationData): string {
    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    const taskUrl = `${baseUrl}/boards/${data.boardId}?taskId=${data.taskId}`;

    if (data.notificationType === 'mention') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .comment { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>You were mentioned in a task</h2>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p><strong>${data.mentionedBy}</strong> mentioned you in <strong>"${data.taskTitle}"</strong> on board <strong>${data.boardName}</strong>.</p>
              ${data.commentContent ? `<div class="comment">${this.escapeHtml(data.commentContent)}</div>` : ''}
              <a href="${taskUrl}" class="button">View Task</a>
            </div>
            <div class="footer">
              <p>Task Management App - Notification System</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>You were assigned to a task</h2>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              <p><strong>${data.assignedBy}</strong> assigned you to <strong>"${data.taskTitle}"</strong> on board <strong>${data.boardName}</strong>.</p>
              <a href="${taskUrl}" class="button">View Task</a>
            </div>
            <div class="footer">
              <p>Task Management App - Notification System</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  private buildEmailText(data: EmailNotificationData): string {
    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    const taskUrl = `${baseUrl}/boards/${data.boardId}?taskId=${data.taskId}`;

    if (data.notificationType === 'mention') {
      return `
Hi ${data.recipientName},

${data.mentionedBy} mentioned you in "${data.taskTitle}" on board ${data.boardName}.

${data.commentContent ? `\n"${data.commentContent}"\n` : ''}
View task: ${taskUrl}

---
Task Management App - Notification System
      `.trim();
    } else {
      return `
Hi ${data.recipientName},

${data.assignedBy} assigned you to "${data.taskTitle}" on board ${data.boardName}.

View task: ${taskUrl}

---
Task Management App - Notification System
      `.trim();
    }
  }

  async sendWelcomeEmail(username: string, email: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.log('Email notifications are disabled');
      return false;
    }

    try {
      const htmlContent = this.buildWelcomeEmailHtml(username);
      const textContent = this.buildWelcomeEmailText(username);

      await this.transporter.sendMail({
        from: {
          name: this.configService.get<string>('SMTP_FROM_NAME', 'Task Management App'),
          address: this.configService.get<string>('SMTP_FROM_EMAIL', 'noreply@task-app.com'),
        },
        to: email,
        subject: 'Welcome to Task Management App!',
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  private buildWelcomeEmailHtml(username: string): string {
    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    const boardsUrl = `${baseUrl}/boards`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          .features { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .features ul { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to Task Management App!</h2>
          </div>
          <div class="content">
            <p>Hi ${this.escapeHtml(username)},</p>
            <p>Thank you for creating an account with us! We're excited to have you on board.</p>
            <div class="features">
              <h3>Get started with these features:</h3>
              <ul>
                <li>Create and manage boards for your projects</li>
                <li>Organize tasks into groups</li>
                <li>Collaborate with team members</li>
                <li>Get real-time notifications</li>
                <li>Track your progress efficiently</li>
              </ul>
            </div>
            <a href="${boardsUrl}" class="button">Go to My Boards</a>
          </div>
          <div class="footer">
            <p>Task Management App - Welcome</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildWelcomeEmailText(username: string): string {
    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    const boardsUrl = `${baseUrl}/boards`;

    return `
Hi ${username},

Thank you for creating an account with us! We're excited to have you on board.

Get started with these features:
- Create and manage boards for your projects
- Organize tasks into groups
- Collaborate with team members
- Get real-time notifications
- Track your progress efficiently

Go to My Boards: ${boardsUrl}

---
Task Management App - Welcome
    `.trim();
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
