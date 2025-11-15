import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from './task.entity';
import { TaskComment } from './task-comment.entity';

@Entity()
export class TaskMention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who was mentioned
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  mentionedUser: User;

  // Who created the mention
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  mentionedBy: User;

  // Where they were mentioned (nullable - one will be set)
  @ManyToOne(() => Task, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  task: Task | null; // If mentioned in task description

  @ManyToOne(() => TaskComment, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  comment: TaskComment | null; // If mentioned in comment

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'varchar', length: 20 })
  mentionType: 'task_description' | 'comment'; // For quick filtering
}
