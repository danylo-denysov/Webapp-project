import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';
import { TaskListItem } from './task-list-item.entity';

@Entity()
export class TaskList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Index()
  @ManyToOne(() => Task, (task) => task.taskLists, {
    onDelete: 'CASCADE',
  })
  task: Task;

  @OneToMany(() => TaskListItem, (item) => item.taskList, {
    cascade: true,
  })
  items: TaskListItem[];
}
