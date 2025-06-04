import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';

@Entity()
export class Task {
  @ApiProperty({
    description: 'Auto-generated UUID for the Task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Title of the Task',
    example: 'Implement user login',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the Task',
    example: 'Use JWT and Passport.js to authenticate users.',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Timestamp when the Task was created',
    example: '2023-07-15T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description:
      'Zero-based integer that determines ordering within its Task Group',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  order: number;

  @ApiProperty({
    description: 'The TaskGroup to which this Task belongs',
    type: () => TaskGroup,
  })
  @Index()
  @ManyToOne(() => TaskGroup, (taskGroup) => taskGroup.tasks, {
    onDelete: 'CASCADE',
  })
  taskGroup: TaskGroup;
}
