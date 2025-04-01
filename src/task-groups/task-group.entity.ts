import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Board } from 'src/boards/board.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class TaskGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  createdAt: Date;

  @Column()
  order: number;

  @ManyToOne(() => Board, (board) => board.taskGroups, { onDelete: 'CASCADE' })
  board: Board;

  @OneToMany(() => Task, (task) => task.taskGroup, { cascade: true })
  tasks: Task[];
}
