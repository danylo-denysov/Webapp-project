import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskGroupsService } from './task-groups.service';
import { CreateTaskGroupDto } from './dto/create-task-group.dto';
import { UpdateTaskGroupDto } from './dto/update-task-group.dto';
import { UpdateGroupOrdersDto } from './dto/update-group-orders.dto';
import { AuthGuard } from '@nestjs/passport';
import { BoardOwnerGuard } from 'src/common/board-owner.guard';
import { TaskGroup } from './task-group.entity';

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
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Task Groups')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(AuthGuard(), BoardOwnerGuard)
@Controller('boards/:boardId/task-groups')
export class TaskGroupsController {
  constructor(private readonly svc: TaskGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all Task Groups for a Board' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Task Groups returned successfully',
    type: TaskGroup,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Board not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  get_task_groups(@Param('boardId') boardId: string): Promise<TaskGroup[]> {
    return this.svc.get_task_groups(boardId);
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Get a single Task Group by ID' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiParam({
    name: 'groupId',
    description: 'UUID of the Task Group',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Task Group returned successfully',
    type: TaskGroup,
  })
  @ApiNotFoundResponse({
    description: 'Board or Task Group not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  get_task_group_by_id(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
  ): Promise<TaskGroup> {
    return this.svc.get_task_group_by_id(groupId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new Task Group under a Board' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiBody({
    description: 'Payload to create a new Task Group',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'To Do' },
        order: { type: 'integer', minimum: 0, example: 0 },
      },
      required: ['name'],
    },
  })
  @ApiCreatedResponse({
    description: 'Task Group created successfully',
    type: TaskGroup,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (400) – e.g., non‐string name or negative order',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., missing name or order not an integer ≥ 0',
  })
  @ApiNotFoundResponse({
    description: 'Board not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  create_task_group(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskGroupDto,
  ): Promise<TaskGroup> {
    return this.svc.create_task_group(boardId, dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Reorder Task Groups within a Board (provide array of Task Group IDs in new order)',
  })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiBody({
    description: 'Payload containing a list of Task Group IDs in desired order',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          example: [
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            'b2c3d4e5-f6a1-7890-abcd-123456ef7890',
            'c3d4e5f6-a1b2-7890-abcd-234567ef8901',
          ],
        },
      },
      required: ['ids'],
    },
  })
  @ApiNoContentResponse({
    description: 'Task Groups reordered successfully (no content)',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input (400) – e.g., missing ids array or invalid UUIDs',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., empty ids array or non‐UUID values',
  })
  @ApiNotFoundResponse({
    description: 'One or more groups not found in this board (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  reorder_task_groups(
    @Param('boardId') boardId: string,
    @Body() dto: UpdateGroupOrdersDto,
  ): Promise<void> {
    return this.svc.reorder_task_groups(boardId, dto.ids);
  }

  @Patch(':groupId')
  @ApiOperation({ summary: 'Update a Task Group’s details' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiParam({
    name: 'groupId',
    description: 'UUID of the Task Group to update',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    description: 'Payload containing fields to update in the Task Group',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'In Progress' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task Group updated successfully',
    type: TaskGroup,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data (400) – e.g., empty string for name',
  })
  @ApiUnprocessableEntityResponse({
    description:
      'Validation failed (422) – e.g., non‐string name',
  })
  @ApiNotFoundResponse({
    description: 'Board or Task Group not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  update_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskGroupDto,
  ): Promise<TaskGroup> {
    return this.svc.update_task_group(boardId, groupId, dto);
  }

  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a Task Group from a Board' })
  @ApiParam({
    name: 'boardId',
    description: 'UUID of the Board',
    example: 'abcd1234-ef56-7890-abcd-123456ef7890',
  })
  @ApiParam({
    name: 'groupId',
    description: 'UUID of the Task Group to delete',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiNoContentResponse({
    description: 'Task Group deleted successfully (no content)',
  })
  @ApiNotFoundResponse({
    description: 'Board or Task Group not found (404)',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden (403) – user is not the owner of the board',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401) – missing or invalid JWT',
  })
  delete_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    return this.svc.delete_task_group(boardId, groupId);
  }
}
