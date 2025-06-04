import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Board } from '../boards/board.entity';

@Entity()
export class User {
  @ApiProperty({
    description: 'Auto-generated UUID for the User',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique username chosen by the user',
    example: 'johndoe',
  })
  @Index()
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'Unique email address of the user',
    example: 'john.doe@example.com',
  })
  @Index()
  @Column({ unique: true })
  email: string;

  // No docs for password in the public API response
  @Column()
  password: string;

  @ApiProperty({
    description: 'Timestamp when the User was created',
    example: '2023-07-15T12:34:56.789Z',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({
    description:
      'Hashed refresh token (stored, but typically not exposed in responses)',
    example: null,
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  current_hashed_refresh_token: string | null;

  @ApiProperty({
    description: 'List of Boards owned by this User',
    type: () => [Board],
  })
  @OneToMany(() => Board, (board) => board.owner, { cascade: true })
  boards: Board[];
}
