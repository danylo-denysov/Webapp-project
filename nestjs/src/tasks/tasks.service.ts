import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskGroup } from 'src/task-groups/task-group.entity';

@Injectable()
export class TasksService {
  // whenever you interact with database its asynchronous operation
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
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
    const found = await this.tasksRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`); // 404 response
    }

    return found; // assert that return param is not null
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
}
