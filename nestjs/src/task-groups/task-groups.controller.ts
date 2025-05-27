import { Controller, Get, Param, Post, Body, Patch, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { TaskGroupsService } from './task-groups.service';
import { CreateTaskGroupDto } from './dto/create-task-group.dto';
import { UpdateTaskGroupDto } from './dto/update-task-group.dto';

@Controller('boards/:boardId/task-groups')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TaskGroupsController {
  constructor(private readonly svc: TaskGroupsService) {}

  @Get()
  get_task_groups(@Param('boardId') boardId: string) {
    return this.svc.get_task_groups(boardId);
  }

  @Get(':groupId')
  get_task_group_by_id(@Param('groupId') groupId: string) {
    return this.svc.get_task_group_by_id(groupId);
  }

  @Post()
  create_task_group(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskGroupDto,
  ) {
    return this.svc.create_task_group(boardId, dto);
  }

  @Patch(':groupId')
  update_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskGroupDto,
  ) {
    return this.svc.update_task_group(boardId, groupId, dto);
  }

  @Delete(':groupId')
  delete_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.svc.delete_task_group(boardId, groupId);
  }
}
