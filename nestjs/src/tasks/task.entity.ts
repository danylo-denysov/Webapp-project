import { Column, Entity, In, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Add default value
  created_at: Date;

  @Column({ type: 'int', default: 0 }) // Allow null for order if not provided, for test cases
  order: number;

  @Index()
  @ManyToOne(() => TaskGroup, (taskGroup) => taskGroup.tasks, {
    onDelete: 'CASCADE',
  })
  taskGroup: TaskGroup;
}
