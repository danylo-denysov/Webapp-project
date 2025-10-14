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
import { BoardAccessService } from '../boards/board-access.service';
import { GetUser } from '../users/get-user.decorator';
import { JwtUserPayload } from '../users/jwt-user-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private boardAccessService: BoardAccessService,
  ) {}

  @Get('group/:groupId')
  async getTasks(
    @Param('groupId') groupId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<Task[]> {
    const boardId = await this.tasksService.getBoardIdFromGroupId(groupId);
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.tasksService.getTasks(groupId);
  }

  @Get('/:id')
  async getTaskById(
    @Param('id') id: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<Task> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(id);
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<Task> {
    const boardId = await this.tasksService.getBoardIdFromGroupId(createTaskDto.groupId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.createTask(createTaskDto);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskById(
    @Param('id') id: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(id);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.deleteTaskById(id);
  }

  @Patch('group/:groupId/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderTasks(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateTaskOrdersDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromGroupId(groupId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.reorderTasks(groupId, dto.ids);
  }
}
