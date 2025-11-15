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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateTaskOrdersDto } from './dto/update-task-orders.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateListOrdersDto } from './dto/update-list-orders.dto';
import { UpdateListItemOrdersDto } from './dto/update-list-item-orders.dto';
import { MoveListItemDto } from './dto/move-list-item.dto';
import { Task } from './task.entity';
import { TaskList } from './task-list.entity';
import { TaskListItem } from './task-list-item.entity';
import { TaskComment } from './task-comment.entity';
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
    const taskId = item.taskList.task.id;

    // Check if user has write access OR is assigned to the task
    const hasWriteAccess = await this.boardAccessService.hasWriteAccess(boardId, user.id);
    const isAssignedToTask = await this.tasksService.isUserAssignedToTask(taskId, user.id);

    if (!hasWriteAccess && !isAssignedToTask) {
      // User must have at least read access to the board
      await this.boardAccessService.verifyReadAccess(boardId, user.id);
      throw new Error('You do not have permission to update this task item');
    }

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

  @Patch(':taskId/lists/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderTaskLists(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateListOrdersDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.reorderTaskLists(taskId, dto.ids);
  }

  @Patch('lists/:listId/items/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderListItems(
    @Param('listId') listId: string,
    @Body() dto: UpdateListItemOrdersDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskListId(listId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.reorderTaskListItems(listId, dto.ids);
  }

  @Patch('lists/items/:itemId/move')
  @HttpCode(HttpStatus.NO_CONTENT)
  async moveListItem(
    @Param('itemId') itemId: string,
    @Body() dto: MoveListItemDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromListItemId(itemId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    const targetBoardId = await this.tasksService.getBoardIdFromTaskListId(dto.targetListId);
    if (boardId !== targetBoardId) {
      throw new Error('Cannot move item to a list in a different task');
    }
    return this.tasksService.moveListItemToList(itemId, dto.targetListId, dto.newOrder);
  }

  // Comment endpoints
  @Post(':taskId/comments')
  async createComment(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskComment> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.tasksService.createComment(dto, taskId, user.id);
  }

  @Get(':taskId/comments')
  async getComments(
    @Param('taskId') taskId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<TaskComment[]> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.tasksService.getComments(taskId);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromCommentId(commentId);
    await this.boardAccessService.verifyReadAccess(boardId, user.id);
    return this.tasksService.deleteComment(commentId, user.id);
  }

  // Task user assignment endpoints
  @Post(':taskId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignUserToTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.assignUserToTask(taskId, userId);
  }

  @Delete(':taskId/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserFromTask(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
    @GetUser() user: JwtUserPayload,
  ): Promise<void> {
    const boardId = await this.tasksService.getBoardIdFromTaskId(taskId);
    await this.boardAccessService.verifyWriteAccess(boardId, user.id);
    return this.tasksService.removeUserFromTask(taskId, userId);
  }
}
