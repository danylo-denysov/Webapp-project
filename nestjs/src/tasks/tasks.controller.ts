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
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { CreateTaskListItemDto } from './dto/create-task-list-item.dto';
import { UpdateTaskListItemDto } from './dto/update-task-list-item.dto';
import { UpdateTaskOrdersDto } from './dto/update-task-orders.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { Task } from './task.entity';
import { TaskList } from './task-list.entity';
import { TaskListItem } from './task-list-item.entity';
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

  @Patch('/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<Task> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(id);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.updateTask(id, updateTaskDto);
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

  @Patch(':id/move')
  @HttpCode(HttpStatus.NO_CONTENT)
  async moveTaskToGroup(
    @Param('id') taskId: string,
    @Body() dto: MoveTaskDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    const targetBoardId = await this.tasksService.getBoardIdFromGroupId(dto.targetGroupId);
    if (boardId !== targetBoardId) {
      throw new Error('Cannot move task to a group in a different board');
    }
    return this.tasksService.moveTaskToGroup(taskId, dto.targetGroupId, dto.newOrder);
  }

  // Task List endpoints
  @Post('lists')
  async createTaskList(
    @Body() dto: CreateTaskListDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskList> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(dto.taskId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.createTaskList(dto);
  }

  @Patch('lists/:id')
  async updateTaskList(
    @Param('id') id: string,
    @Body() dto: UpdateTaskListDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskList> {
    const taskList = await this.tasksService['taskListsRepository'].findOne({
      where: { id },
      relations: ['task', 'task.taskGroup', 'task.taskGroup.board'],
    });
    if (!taskList) throw new Error('Task list not found');
    const boardId = taskList.task.taskGroup.board.id;
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.updateTaskList(id, dto);
  }

  @Delete('lists/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskList(
    @Param('id') id: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const taskList = await this.tasksService['taskListsRepository'].findOne({
      where: { id },
      relations: ['task', 'task.taskGroup', 'task.taskGroup.board'],
    });
    if (!taskList) throw new Error('Task list not found');
    const boardId = taskList.task.taskGroup.board.id;
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.deleteTaskList(id);
  }

  @Post('lists/items')
  async createTaskListItem(
    @Body() dto: CreateTaskListItemDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskListItem> {
    const taskList = await this.tasksService['taskListsRepository'].findOne({
      where: { id: dto.taskListId },
      relations: ['task', 'task.taskGroup', 'task.taskGroup.board'],
    });
    if (!taskList) throw new Error('Task list not found');
    const boardId = taskList.task.taskGroup.board.id;
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.createTaskListItem(dto);
  }

  @Patch('lists/items/:id')
  async updateTaskListItem(
    @Param('id') id: string,
    @Body() dto: UpdateTaskListItemDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskListItem> {
    const item = await this.tasksService['taskListItemsRepository'].findOne({
      where: { id },
      relations: ['taskList', 'taskList.task', 'taskList.task.taskGroup', 'taskList.task.taskGroup.board'],
    });
    if (!item) throw new Error('Task list item not found');
    const boardId = item.taskList.task.taskGroup.board.id;
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.updateTaskListItem(id, dto);
  }

  @Delete('lists/items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTaskListItem(
    @Param('id') id: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const item = await this.tasksService['taskListItemsRepository'].findOne({
      where: { id },
      relations: ['taskList', 'taskList.task', 'taskList.task.taskGroup', 'taskList.task.taskGroup.board'],
    });
    if (!item) throw new Error('Task list item not found');
    const boardId = item.taskList.task.taskGroup.board.id;
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.deleteTaskListItem(id);
  }
}
