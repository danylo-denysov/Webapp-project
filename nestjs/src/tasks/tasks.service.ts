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

  async get_tasks(groupId?: string): Promise<Task[]> {
    if (!groupId) {
      return this.tasksRepository.find({ order: { created_at: 'ASC' } });
    }

    return this.tasksRepository.find({
      where: { taskGroup: { id: groupId } },
      order: { created_at: 'ASC' },
    });
  }

  async get_task_by_id(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`); // 404 response
    }

    return found; // assert that return param is not null
  }

  async create_task(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, groupId } = createTaskDto;

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Task-group not found');

    const task = this.tasksRepository.create({
      title,
      description,
      taskGroup: group,
    });
    await this.tasksRepository.save(task);
    return task;
  }

  async delete_task_by_id(id: string): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`); // 404 response
    }
  }
}
