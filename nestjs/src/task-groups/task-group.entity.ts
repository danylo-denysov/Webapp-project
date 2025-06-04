import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Board } from 'src/boards/board.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class TaskGroup {
  @ApiProperty({
    description: 'Auto-generated UUID for the TaskGroup',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name/title of the TaskGroup',
    example: 'To Do',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Timestamp when the TaskGroup was created',
    example: '2023-07-15T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description:
      'Zero-based integer determining this group’s order within its Board',
    example: 0,
  })
  @Column()
  order: number;

  @ApiProperty({
    description: 'The Board to which this TaskGroup belongs',
    type: () => Board,
  })
  @Index()
  @ManyToOne(() => Board, (board) => board.taskGroups, { onDelete: 'CASCADE' })
  board: Board;

  @ApiProperty({
    description: 'List of Tasks in this group (ordered by `order` field)',
    type: () => [Task],
  })
  @OneToMany(() => Task, (task) => task.taskGroup, { cascade: true })
  tasks: Task[];
}
