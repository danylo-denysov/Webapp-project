import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';
import { TaskList } from './task-list.entity';

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
}
