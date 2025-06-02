import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskGroup } from './task-group.entity';
import { Board } from 'src/boards/board.entity';
import { TaskGroupsController } from './task-groups.controller';
import { TaskGroupsService } from './task-groups.service';
import { BoardsModule } from 'src/boards/boards.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([TaskGroup, Board]),
    BoardsModule,
  ],
  controllers: [TaskGroupsController],
  providers: [TaskGroupsService],
  exports: [TypeOrmModule],
})
export class TaskGroupsModule {}
