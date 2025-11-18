import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserNotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'boolean', default: true })
  emailOnMention: boolean;

  @Column({ type: 'boolean', default: true })
  emailOnAssignment: boolean;

  @Column({ type: 'boolean', default: false })
  webhookOnMention: boolean;

  @Column({ type: 'boolean', default: false })
  webhookOnAssignment: boolean;

  @Column({ type: 'text', nullable: true })
  webhookUrl: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
