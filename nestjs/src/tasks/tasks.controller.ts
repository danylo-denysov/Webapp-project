import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.entity';
import { UpdateTaskOrdersDto } from './dto/update-task-orders.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('group/:groupId')
  getTasks(@Param('groupId') groupId: string): Promise<Task[]> {
    return this.tasksService.get_tasks(groupId);
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.get_task_by_id(id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create_task(createTaskDto);
  }

  @Delete('/:id')
  deleteTaskById(@Param('id') id: string): Promise<void> {
    return this.tasksService.delete_task_by_id(id);
  }

  @Patch('group/:groupId/reorder')
  reorderTasks(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskOrdersDto,
  ): Promise<void> {
    return this.tasksService.reorder_tasks(groupId, dto.ids);
  }
}
