import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TaskGroupsController } from '../../src/task-groups/task-groups.controller';
import { TaskGroupsService } from '../../src/task-groups/task-groups.service';
import { BoardsService } from '../../src/boards/boards.service';
import { createTestingApp } from '../app-factory';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/users/jwt-refresh.guard';

describe('Task-Groups endpoints (e2e)', () => {
  let app: INestApplication;

  const boardsService = {
    verifyOwner: jest.fn().mockResolvedValue({ id: 'board-1' }),
  };
  const groupsService = {
    create_task_group: jest.fn().mockResolvedValue({ id: '123e4567-e89b-42d3-a456-426614174000', name: 'To Do' }),
    reorder_task_groups: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TaskGroupsController],
      providers: [
        { provide: TaskGroupsService, useValue: groupsService },
        { provide: BoardsService, useValue: boardsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = await createTestingApp(module);
  });

  afterAll(() => app.close());

  it('POST /api/boards/:boardId/task-groups → 201', () =>
    request(app.getHttpServer())
      .post('/api/boards/board-1/task-groups')
      .send({ name: 'To Do' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(groupsService.create_task_group).toHaveBeenCalled();
      }));

  it('PATCH /reorder → 204', () =>
    request(app.getHttpServer())
      .patch('/api/boards/board-1/task-groups/reorder')
      .send({ ids: ['123e4567-e89b-42d3-a456-426614174000'] })
      .expect(204));
});
