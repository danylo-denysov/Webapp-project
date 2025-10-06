import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskOrdersDto } from './dto/update-task-orders.dto';
import { Task } from './task.entity';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('group/:groupId')
  getTasks(@Param('groupId') groupId: string): Promise<Task[]> {
    return this.tasksService.getTasks(groupId);
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTaskById(@Param('id') id: string): Promise<void> {
    return this.tasksService.deleteTaskById(id);
  }

  @Patch('group/:groupId/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderTasks(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskOrdersDto,
  ): Promise<void> {
    return this.tasksService.reorderTasks(groupId, dto.ids);
  }
}
