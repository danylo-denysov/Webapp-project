import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Board } from './board.entity';
import { BoardUserRole } from './board-user-role.enum';

@Entity()
export class BoardUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Board, (board) => board.id, { onDelete: 'CASCADE' })
  board: Board;

  @Column()
  role: BoardUserRole;
}
