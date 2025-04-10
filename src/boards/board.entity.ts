import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { TaskGroup } from '../task-groups/task-group.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Add default value
  created_at: Date;

  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => TaskGroup, (taskGroup) => taskGroup.board, { cascade: true })
  taskGroups: TaskGroup[];
}
