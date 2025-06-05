import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { BoardsController } from '../../src/boards/boards.controller';
import { BoardsService } from '../../src/boards/boards.service';
import { createTestingApp } from '../app-factory';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/users/jwt-refresh.guard';

describe('Boards endpoints (e2e)', () => {
  let app: INestApplication;
  const boardsService = {
    create_board: jest.fn().mockResolvedValue({ id: 'b-1', name: 'Sprint' }),
    get_board_by_id: jest.fn().mockImplementation(() => {
      throw new NotFoundException();
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [{ provide: BoardsService, useValue: boardsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = await createTestingApp(module);
  });

  afterAll(() => app.close());

  it('POST /api/boards/user → 201 & body', () =>
    request(app.getHttpServer())
      .post('/api/boards/user')
      .send({ name: 'Sprint' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBe('b-1');
        expect(boardsService.create_board).toHaveBeenCalledWith(
          { name: 'Sprint' },
          'user-1',
        );
      }));

  it('GET /api/boards/:id/user → 404', () =>
    request(app.getHttpServer())
      .get('/api/boards/does-not-exist/user')
      .expect(404));
});
