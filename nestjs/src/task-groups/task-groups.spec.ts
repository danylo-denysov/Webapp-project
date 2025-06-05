import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskGroupsService } from './task-groups.service';
import { TaskGroup } from './task-group.entity';
import { Board } from '../boards/board.entity';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createMockRepo } from '../../test/mock-repository';

describe('TaskGroupsService', () => {
  let service: TaskGroupsService;

  const groupRepo = createMockRepo<TaskGroup>();
  const boardRepo = createMockRepo<Board>();
  const dataSource = { transaction: jest.fn().mockImplementation((cb) => cb({ update: jest.fn() })) } as any as DataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TaskGroupsService,
        { provide: getRepositoryToken(TaskGroup), useValue: groupRepo },
        { provide: getRepositoryToken(Board), useValue: boardRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(TaskGroupsService);
    jest.clearAllMocks();
  });

  it('get_task_groups throws when board absent', async () => {
    boardRepo.findOneBy.mockResolvedValue(null);
    await expect(service.get_task_groups('no-board')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create_task_group auto-appends order when omitted', async () => {
    boardRepo.findOneBy.mockResolvedValue({ id: 'b1', name: 'Demo', owner: {} } as any);
    groupRepo.createQueryBuilder.mockReturnValue({
      select: () => ({
        where: () => ({
          getRawOne: () => Promise.resolve({ max: 2 }) as any,
        }),
      }),
    });

    groupRepo.create.mockImplementation((x) => x as any);
    groupRepo.save.mockImplementation((x) => x);

    const res = await service.create_task_group('b1', { name: 'New' });
    expect(res.order).toBe(3);
  });

  it('reorder_task_groups throws on unknown id', async () => {
    groupRepo.find.mockResolvedValue([
      { id: 'g1', name: '', order: 0, board: {}, created_at: new Date() } as any,
    ]);
    await expect(
      service.reorder_task_groups('b1', ['g1', 'missing']),
    ).rejects.toThrow(NotFoundException);
  });
});
