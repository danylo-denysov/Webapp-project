import { Controller, Get, Param, Post, Body, Patch, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { TaskGroupsService } from './task-groups.service';
import { CreateTaskGroupDto } from './dto/create-task-group.dto';
import { UpdateTaskGroupDto } from './dto/update-task-group.dto';
import { UpdateGroupOrdersDto } from './dto/update-group-orders.dto';
import { AuthGuard } from '@nestjs/passport';
import { BoardOwnerGuard } from 'src/common/board-owner.guard';

@Controller('boards/:boardId/task-groups')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(AuthGuard(), BoardOwnerGuard)
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

  @Patch('reorder')
  reorder_task_groups(
    @Param('boardId') boardId: string,
    @Body() dto: UpdateGroupOrdersDto,
  ) {
    return this.svc.reorder_task_groups(boardId, dto.ids);
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
