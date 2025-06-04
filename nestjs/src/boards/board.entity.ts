import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { TaskGroup } from '../task-groups/task-group.entity';

@Entity()
export class Board {
  @ApiProperty({
    description: 'Auto-generated UUID for the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name/title of the Board',
    example: 'Development Roadmap',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Timestamp when the Board was created',
    example: '2023-07-15T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description: 'The User who owns this Board',
    type: () => User,
  })
  @Index()
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  owner: User;

  @ApiProperty({
    description: 'List of TaskGroups belonging to this Board (ordered by `order`)',
    type: () => [TaskGroup],
  })
  @OneToMany(() => TaskGroup, (taskGroup) => taskGroup.board, { cascade: true })
  taskGroups: TaskGroup[];
}
