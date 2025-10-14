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
import { TaskGroup } from './task-group.entity';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { BoardAccessService } from 'src/boards/board-access.service';
import { GetUser } from 'src/users/get-user.decorator';
import { JwtUserPayload } from 'src/users/jwt-user-payload.interface';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/task-groups')
export class TaskGroupsController {
  constructor(
    private readonly svc: TaskGroupsService,
    private readonly boardAccessService: BoardAccessService,
  ) {}

  @Get()
  async getTaskGroups(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup[]> {
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.svc.getTaskGroups(boardId);
  }

  @Get(':groupId')
  async getTaskGroupById(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.svc.getTaskGroupById(groupId);
  }

  @Post()
  async createTaskGroup(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskGroupDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.svc.createTaskGroup(boardId, dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderTaskGroups(
    @Param('boardId') boardId: string,
    @Body() dto: UpdateGroupOrdersDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.svc.reorderTaskGroups(boardId, dto.ids);
  }

  @Patch(':groupId')
  async updateTaskGroup(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskGroupDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.svc.updateTaskGroup(boardId, groupId, dto);
  }

  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskGroup(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.svc.deleteTaskGroup(boardId, groupId);
  }
}
