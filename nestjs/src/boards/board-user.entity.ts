import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Board } from './board.entity';
import { BoardUserRole } from './board-user-role.enum';

@Entity()
export class BoardUser {
  @ApiProperty({
    description: 'Auto-generated UUID for the BoardUser relationship',
    example: 'd4e5f6a1-b2c3-7890-abcd-234567ef8901',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The User assigned to this Board',
    type: () => User,
  })
  @Index()
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({
    description: 'The Board to which this user is assigned',
    type: () => Board,
  })
  @Index()
  @ManyToOne(() => Board, (board) => board.id, { onDelete: 'CASCADE' })
  board: Board;

  @ApiProperty({
    description: 'Role of the user on this board',
    enum: BoardUserRole,
    example: BoardUserRole.EDITOR,
  })
  @Column()
  role: BoardUserRole;
}
