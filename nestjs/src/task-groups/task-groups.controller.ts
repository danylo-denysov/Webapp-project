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
import { AuthGuard } from '@nestjs/passport';
import { BoardsService } from 'src/boards/boards.service';
import { GetUser } from 'src/users/get-user.decorator';
import { JwtUserPayload } from 'src/users/jwt-user-payload.interface';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(AuthGuard())
@Controller('boards/:boardId/task-groups')
export class TaskGroupsController {
  constructor(
    private readonly svc: TaskGroupsService,
    private readonly boardsService: BoardsService,
  ) {}

  @Get()
  async get_task_groups(
    @Param('boardId') boardId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup[]> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.get_task_groups(boardId);
  }

  @Get(':groupId')
  async get_task_group_by_id(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.get_task_group_by_id(groupId);
  }

  @Post()
  async create_task_group(
    @Param('boardId') boardId: string,
    @Body() dto: CreateTaskGroupDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.create_task_group(boardId, dto);
  }

  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder_task_groups(
    @Param('boardId') boardId: string,
    @Body() dto: UpdateGroupOrdersDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.reorder_task_groups(boardId, dto.ids);
  }

  @Patch(':groupId')
  async update_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskGroupDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskGroup> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.update_task_group(boardId, groupId, dto);
  }

  @Delete(':groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete_task_group(
    @Param('boardId') boardId: string,
    @Param('groupId') groupId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    await this.boardsService.verifyOwner(boardId, user.id);
    return this.svc.delete_task_group(boardId, groupId);
  }
}
