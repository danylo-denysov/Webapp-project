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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  user: User;

  @Index()
  @ManyToOne(() => Board, (board) => board.id, { onDelete: 'CASCADE' })
  board: Board;

  @Column()
  role: BoardUserRole;
}
