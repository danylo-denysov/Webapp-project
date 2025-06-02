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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskOrdersDto } from './dto/update-task-orders.dto';
import { Task } from './task.entity';

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get all tasks for a given Task Group' })
  @ApiParam({
    name: 'groupId',
    description: 'UUID of the Task Group',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tasks returned successfully',
    type: Task,
    isArray: true,
  })
  getTasks(@Param('groupId') groupId: string): Promise<Task[]> {
    return this.tasksService.get_tasks(groupId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a single Task by its ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Task returned successfully',
    type: Task,
  })
  @ApiNotFoundResponse({
    description: 'Task not found (404)',
  })
  getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.get_task_by_id(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Task' })
  @ApiBody({
    description: 'Payload to create a new Task',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Implement user login' },
        description: { type: 'string', example: 'Use JWT and Passport.' },
        groupId: {
          type: 'string',
          format: 'uuid',
          example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        },
      },
      required: ['title', 'description', 'groupId'],
    },
  })
  @ApiCreatedResponse({
    description: 'Task created successfully',
    type: Task,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (400)',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., missing required fields or invalid formats',
  })
  @ApiNotFoundResponse({
    description: 'Task Group not found (404)',
  })
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create_task(createTaskDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Task by its ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Task to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Task deleted successfully (no content)',
  })
  @ApiNotFoundResponse({
    description: 'Task not found (404)',
  })
  deleteTaskById(@Param('id') id: string): Promise<void> {
    return this.tasksService.delete_task_by_id(id);
  }

  @Patch('group/:groupId/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Reorder multiple Tasks within a Task Group (provide array of Task IDs in new order)',
  })
  @ApiParam({
    name: 'groupId',
    description: 'UUID of the Task Group',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    description: 'Payload containing a list of Task IDs in desired order',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '223e4567-e89b-12d3-a456-426614174001',
            '323e4567-e89b-12d3-a456-426614174002',
          ],
        },
      },
      required: ['ids'],
    },
  })
  @ApiNoContentResponse({
    description: 'Tasks reordered successfully (no content)',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input (400) – e.g., missing ids array or invalid UUIDs',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., duplicate IDs or group mismatch',
  })
  @ApiNotFoundResponse({
    description: 'One or more tasks not found in this group (404)',
  })
  reorderTasks(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskOrdersDto,
  ): Promise<void> {
    return this.tasksService.reorder_tasks(groupId, dto.ids);
  }
}
