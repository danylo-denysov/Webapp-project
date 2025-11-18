import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';
import { TaskMention } from './task-mention.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Task, (task) => task.comments, {
    onDelete: 'CASCADE',
  })
  task: Task;

  @ManyToOne(() => User, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(() => TaskMention, (mention) => mention.comment)
  mentions: TaskMention[];
}
