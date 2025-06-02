import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Board } from '../boards/board.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Add default value
  created_at: Date;

  @Column({ type: 'text', nullable: true })
  current_hashed_refresh_token: string | null;

  @OneToMany(() => Board, (board) => board.owner, { cascade: true })
  boards: Board[];
}
