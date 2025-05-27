import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskGroup } from './task-group.entity';
import { Board } from 'src/boards/board.entity';
import { TaskGroupsController } from './task-groups.controller';
import { TaskGroupsService } from './task-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskGroup, Board])],
  controllers: [TaskGroupsController],
  providers: [TaskGroupsService],
  exports: [TypeOrmModule],
})
export class TaskGroupsModule {}
