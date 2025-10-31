import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';
import { CreateTaskListItemDto } from './dto/create-task-list-item.dto';
import { UpdateTaskListItemDto } from './dto/update-task-list-item.dto';
import { Task } from './task.entity';
import { TaskList } from './task-list.entity';
import { TaskListItem } from './task-list-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';

@Injectable()
export class TasksService {
  // whenever you interact with database its asynchronous operation
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    @InjectRepository(TaskList) private taskListsRepository: Repository<TaskList>,
    @InjectRepository(TaskListItem) private taskListItemsRepository: Repository<TaskListItem>,
    @InjectRepository(TaskGroup) private readonly groupRepository: Repository<TaskGroup>,
  ) {}

  async getTasks(groupId?: string): Promise<Task[]> {
    if (!groupId) {
      return this.tasksRepository.find({ order: { order: 'ASC' } });
    }

    return this.tasksRepository.find({
      where: { taskGroup: { id: groupId } },
      order: { order: 'ASC' },
    });
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({
      where: { id },
      relations: ['taskGroup', 'taskGroup.board', 'taskLists', 'taskLists.items'],
    });
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    // Sort task lists and their items by order
    if (found.taskLists) {
      found.taskLists.sort((a, b) => a.order - b.order);
      found.taskLists.forEach(list => {
        if (list.items) {
          list.items.sort((a, b) => a.order - b.order);
        }
      });
    }

    return found;
  }

  async getBoardIdFromGroupId(groupId: string): Promise<string> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['board'],
    });
    if (!group) {
      throw new NotFoundException(`Task group with ID "${groupId}" not found`);
    }
    return group.board.id;
  }

  async getBoardIdFromTaskId(taskId: string): Promise<string> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['taskGroup', 'taskGroup.board'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }
    return task.taskGroup.board.id;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, groupId } = createTaskDto;

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Task-group not found');

    const maxRaw = await this.tasksRepository
      .createQueryBuilder('t')
      .select('MAX(t.order)', 'max')
      .where('t.taskGroupId = :groupId', { groupId })
      .getRawOne<{ max: number }>();
    const nextOrder = (maxRaw?.max ?? -1) + 1;

    const task = this.tasksRepository.create({
      title,
      description,
      taskGroup: group,
      order: nextOrder,
    });
    await this.tasksRepository.save(task);
    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.getTaskById(id);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    await this.tasksRepository.save(task);
    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`); // 404 response
    }
  }

  async reorderTasks(groupId: string, ids: string[]): Promise<void> {
    const existing = await this.tasksRepository.find({
      where: { taskGroup: { id: groupId } },
      select: ['id'],
    });
    const existingIds = new Set(existing.map((t) => t.id));
    if (ids.some((id) => !existingIds.has(id))) {
      throw new NotFoundException('One or more tasks not found in this group');
    }

    await this.tasksRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < ids.length; i++) {
        await manager.update(Task, { id: ids[i] }, { order: i });
      }
    });
  }

  async moveTaskToGroup(taskId: string, targetGroupId: string, newOrder: number): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ['taskGroup'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }

    const targetGroup = await this.groupRepository.findOne({
      where: { id: targetGroupId },
    });
    if (!targetGroup) {
      throw new NotFoundException(`Target group with ID "${targetGroupId}" not found`);
    }

    const sourceGroupId = task.taskGroup.id;

    await this.tasksRepository.manager.transaction(async (manager) => {
      if (sourceGroupId === targetGroupId) {
        const tasksInGroup = await manager.find(Task, {
          where: { taskGroup: { id: targetGroupId } },
          order: { order: 'ASC' },
        });

        const oldIndex = tasksInGroup.findIndex((t) => t.id === taskId);
        if (oldIndex === -1) return;

        tasksInGroup.splice(oldIndex, 1);
        tasksInGroup.splice(newOrder, 0, task);

        for (let i = 0; i < tasksInGroup.length; i++) {
          await manager.update(Task, { id: tasksInGroup[i].id }, { order: i });
        }
      } else {
        const tasksInTargetGroup = await manager.find(Task, {
          where: { taskGroup: { id: targetGroupId } },
          order: { order: 'ASC' },
        });

        await manager.update(Task, { id: taskId }, { taskGroup: targetGroup });

        tasksInTargetGroup.splice(newOrder, 0, task);

        for (let i = 0; i < tasksInTargetGroup.length; i++) {
          await manager.update(Task, { id: tasksInTargetGroup[i].id }, { order: i });
        }

        const tasksInSourceGroup = await manager.find(Task, {
          where: { taskGroup: { id: sourceGroupId } },
          order: { order: 'ASC' },
        });
        for (let i = 0; i < tasksInSourceGroup.length; i++) {
          await manager.update(Task, { id: tasksInSourceGroup[i].id }, { order: i });
        }
      }
    });
  }

  // Task List methods
  async createTaskList(createTaskListDto: CreateTaskListDto): Promise<TaskList> {
    const { name, taskId } = createTaskListDto;

    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const maxRaw = await this.taskListsRepository
      .createQueryBuilder('tl')
      .select('MAX(tl.order)', 'max')
      .where('tl.taskId = :taskId', { taskId })
      .getRawOne<{ max: number }>();
    const nextOrder = (maxRaw?.max ?? -1) + 1;

    const taskList = this.taskListsRepository.create({
      name,
      task,
      order: nextOrder,
    });
    await this.taskListsRepository.save(taskList);
    taskList.items = [];
    return taskList;
  }

  async createTaskListItem(createTaskListItemDto: CreateTaskListItemDto): Promise<TaskListItem> {
    const { content, taskListId } = createTaskListItemDto;

    const taskList = await this.taskListsRepository.findOne({ where: { id: taskListId } });
    if (!taskList) throw new NotFoundException('Task list not found');

    const maxRaw = await this.taskListItemsRepository
      .createQueryBuilder('tli')
      .select('MAX(tli.order)', 'max')
      .where('tli.taskListId = :taskListId', { taskListId })
      .getRawOne<{ max: number }>();
    const nextOrder = (maxRaw?.max ?? -1) + 1;

    const item = this.taskListItemsRepository.create({
      content,
      taskList,
      order: nextOrder,
    });
    await this.taskListItemsRepository.save(item);
    return item;
  }

  async updateTaskList(id: string, updateDto: UpdateTaskListDto): Promise<TaskList> {
    const taskList = await this.taskListsRepository.findOne({ where: { id } });
    if (!taskList) throw new NotFoundException('Task list not found');

    if (updateDto.name !== undefined) {
      taskList.name = updateDto.name;
    }

    await this.taskListsRepository.save(taskList);
    return taskList;
  }

  async updateTaskListItem(id: string, updateDto: UpdateTaskListItemDto): Promise<TaskListItem> {
    const item = await this.taskListItemsRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Task list item not found');

    if (updateDto.content !== undefined) {
      item.content = updateDto.content;
    }
    if (updateDto.completed !== undefined) {
      item.completed = updateDto.completed;
    }

    await this.taskListItemsRepository.save(item);
    return item;
  }

  async deleteTaskList(id: string): Promise<void> {
    const result = await this.taskListsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task list with ID "${id}" not found`);
    }
  }

  async deleteTaskListItem(id: string): Promise<void> {
    const result = await this.taskListItemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task list item with ID "${id}" not found`);
    }
  }

  async reorderTaskLists(taskId: string, ids: string[]): Promise<void> {
    const existing = await this.taskListsRepository.find({
      where: { task: { id: taskId } },
      select: ['id'],
    });
    const existingIds = new Set(existing.map((tl) => tl.id));
    if (ids.some((id) => !existingIds.has(id))) {
      throw new NotFoundException('One or more task lists not found in this task');
    }

    await this.taskListsRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < ids.length; i++) {
        await manager.update(TaskList, { id: ids[i] }, { order: i });
      }
    });
  }

  async reorderTaskListItems(listId: string, ids: string[]): Promise<void> {
    const existing = await this.taskListItemsRepository.find({
      where: { taskList: { id: listId } },
      select: ['id'],
    });
    const existingIds = new Set(existing.map((item) => item.id));
    if (ids.some((id) => !existingIds.has(id))) {
      throw new NotFoundException('One or more list items not found in this list');
    }

    await this.taskListItemsRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < ids.length; i++) {
        await manager.update(TaskListItem, { id: ids[i] }, { order: i });
      }
    });
  }

  async moveListItemToList(itemId: string, targetListId: string, newOrder: number): Promise<void> {
    const item = await this.taskListItemsRepository.findOne({
      where: { id: itemId },
      relations: ['taskList'],
    });
    if (!item) {
      throw new NotFoundException(`List item with ID "${itemId}" not found`);
    }

    const targetList = await this.taskListsRepository.findOne({
      where: { id: targetListId },
    });
    if (!targetList) {
      throw new NotFoundException(`Target list with ID "${targetListId}" not found`);
    }

    const sourceListId = item.taskList.id;

    await this.taskListItemsRepository.manager.transaction(async (manager) => {
      if (sourceListId === targetListId) {
        // Moving within the same list
        const itemsInList = await manager.find(TaskListItem, {
          where: { taskList: { id: targetListId } },
          order: { order: 'ASC' },
        });

        const oldIndex = itemsInList.findIndex((i) => i.id === itemId);
        if (oldIndex === -1) return;

        itemsInList.splice(oldIndex, 1);
        itemsInList.splice(newOrder, 0, item);

        for (let i = 0; i < itemsInList.length; i++) {
          await manager.update(TaskListItem, { id: itemsInList[i].id }, { order: i });
        }
      } else {
        // Moving to a different list
        const itemsInTargetList = await manager.find(TaskListItem, {
          where: { taskList: { id: targetListId } },
          order: { order: 'ASC' },
        });

        await manager.update(TaskListItem, { id: itemId }, { taskList: targetList });

        itemsInTargetList.splice(newOrder, 0, item);

        for (let i = 0; i < itemsInTargetList.length; i++) {
          await manager.update(TaskListItem, { id: itemsInTargetList[i].id }, { order: i });
        }

        // Reorder remaining items in source list
        const itemsInSourceList = await manager.find(TaskListItem, {
          where: { taskList: { id: sourceListId } },
          order: { order: 'ASC' },
        });
        for (let i = 0; i < itemsInSourceList.length; i++) {
          await manager.update(TaskListItem, { id: itemsInSourceList[i].id }, { order: i });
        }
      }
    });
  }

  async getBoardIdFromTaskListId(listId: string): Promise<string> {
    const taskList = await this.taskListsRepository.findOne({
      where: { id: listId },
      relations: ['task', 'task.taskGroup', 'task.taskGroup.board'],
    });
    if (!taskList) {
      throw new NotFoundException(`Task list with ID "${listId}" not found`);
    }
    return taskList.task.taskGroup.board.id;
  }

  async getBoardIdFromListItemId(itemId: string): Promise<string> {
    const item = await this.taskListItemsRepository.findOne({
      where: { id: itemId },
      relations: ['taskList', 'taskList.task', 'taskList.task.taskGroup', 'taskList.task.taskGroup.board'],
    });
    if (!item) {
      throw new NotFoundException(`List item with ID "${itemId}" not found`);
    }
    return item.taskList.task.taskGroup.board.id;
  }
}
