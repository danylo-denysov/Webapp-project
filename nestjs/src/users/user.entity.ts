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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  username: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  current_hashed_refresh_token: string | null;

  @Column({ type: 'text', nullable: true })
  profile_picture: string | null;

  @OneToMany(() => Board, (board) => board.owner, { cascade: true })
  boards: Board[];
}
