import { Column, Entity, Index, ManyToOne, OneToMany, ManyToMany, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';
import { TaskList } from './task-list.entity';
import { TaskComment } from './task-comment.entity';
import { TaskMention } from './task-mention.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Index()
  @ManyToOne(() => TaskGroup, (taskGroup) => taskGroup.tasks, {
    onDelete: 'CASCADE',
  })
  taskGroup: TaskGroup;

  @OneToMany(() => TaskList, (taskList) => taskList.task, {
    cascade: true,
  })
  taskLists: TaskList[];

  @OneToMany(() => TaskComment, (taskComment) => taskComment.task, {
    cascade: true,
  })
  comments: TaskComment[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_users',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @OneToMany(() => TaskMention, (mention) => mention.task)
  mentions: TaskMention[];
}
