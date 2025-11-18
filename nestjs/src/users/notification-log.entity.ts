import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  MENTION = 'mention',
  ASSIGNMENT = 'assignment',
}

export enum NotificationChannel {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity()
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'varchar',
    length: 20,
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'varchar',
    length: 20,
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    type: 'varchar',
    length: 20,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'uuid', nullable: true })
  relatedTaskId: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;
}
