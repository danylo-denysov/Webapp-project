import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { User } from '../users/user.entity';
import { BoardUser } from './board-user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Board, User, BoardUser])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
