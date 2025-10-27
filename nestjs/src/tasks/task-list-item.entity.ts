import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskList } from './task-list.entity';

@Entity()
export class TaskListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Index()
  @ManyToOne(() => TaskList, (taskList) => taskList.items, {
    onDelete: 'CASCADE',
  })
  taskList: TaskList;
}
