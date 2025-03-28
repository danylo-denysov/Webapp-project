import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  get_all_tasks(): Task[] {
    return this.tasks;
  }

  get_tasks_with_filters(filterDto: any): Task[] {
    const { status, search } = filterDto;

    let tasks = this.get_all_tasks();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    if (search) {
      tasks = tasks.filter(
        (task) =>
          task.title.includes(search) || task.description.includes(search),
      );
    }

    return tasks;
  }

  get_task_by_id(id: string): Task {
    return this.tasks.find((task) => task.id === id)!; // assert that return param is not null
  }

  create_task(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;

    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  delete_task_by_id(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  update_task_status(id: string, status: TaskStatus) {
    const task = this.get_task_by_id(id);
    task.status = status;
    return task;
  }
}
