import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskList } from './task-list.entity';
import { TaskListItem } from './task-list-item.entity';
import { TaskComment } from './task-comment.entity';
import { TaskGroup } from '../task-groups/task-group.entity';
import { User } from '../users/user.entity';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskList, TaskListItem, TaskComment, TaskGroup, User]),
    BoardsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TypeOrmModule],
})
export class TasksModule {}
