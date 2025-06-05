import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TaskGroup } from '../task-groups/task-group.entity';
import { NotFoundException } from '@nestjs/common';
import { createMockRepo } from '../../test/mock-repository';

describe('TasksService', () => {
  let service: TasksService;

  const taskRepo = createMockRepo<Task>();
  const groupRepo = createMockRepo<TaskGroup>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(TaskGroup), useValue: groupRepo },
      ],
    }).compile();

    service = module.get(TasksService);
    jest.clearAllMocks();
  });

  it('get_task_by_id throws 404', async () => {
    taskRepo.findOne.mockResolvedValue(null);
    await expect(service.get_task_by_id('x')).rejects.toThrow(NotFoundException);
  });

  it('create_task throws when group missing', async () => {
    groupRepo.findOne.mockResolvedValue(null);
    await expect(
      service.create_task({
        title: 'T',
        description: 'D',
        groupId: 'missing',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('reorder_tasks throws on unknown id', async () => {
    taskRepo.find.mockResolvedValue([
      { id: 't1', title: '', description: '', order: 0, taskGroup: {} } as any,
    ]);
    await expect(
      service.reorder_tasks('g1', ['t1', 'unknown']),
    ).rejects.toThrow(NotFoundException);
  });
});
