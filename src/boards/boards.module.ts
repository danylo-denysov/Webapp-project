import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board.entity';
import { BoardUser } from './board-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardUser])],
  exports: [TypeOrmModule],
})
export class BoardsModule {}
