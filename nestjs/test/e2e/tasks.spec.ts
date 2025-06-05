import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TasksController } from '../../src/tasks/tasks.controller';
import { TasksService } from '../../src/tasks/tasks.service';
import { createTestingApp } from '../app-factory';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/users/jwt-refresh.guard';

describe('Tasks endpoints (e2e)', () => {
  let app: INestApplication;
  const tasksService = {
    create_task: jest.fn().mockResolvedValue({ id: 't-1', title: 'Login' }),
    delete_task_by_id: jest.fn().mockImplementation(() => {
      throw new NotFoundException();
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = await createTestingApp(module);
  });

  afterAll(() => app.close());

  it('POST /api/tasks → 201', () =>
    request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Login',
        description: 'JWT',
        groupId: 'g-1',
      })
      .expect(201)
      .expect(({ body }) => expect(body.id).toBe('t-1')));

  it('DELETE /api/tasks/:id → 404', () =>
    request(app.getHttpServer())
      .delete('/api/tasks/bad-id')
      .expect(404));
});
