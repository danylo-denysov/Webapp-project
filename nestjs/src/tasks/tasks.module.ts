import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskGroup } from '../task-groups/task-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskGroup])], // Register the Task and TaskGroup entities with TypeORM
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TypeOrmModule],
})
export class TasksModule {}
