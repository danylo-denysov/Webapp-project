import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { createTestingApp } from '../app-factory';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/users/jwt-refresh.guard';

describe('Users endpoints (e2e)', () => {
  let app: INestApplication;

  const usersService = {
    create_user: jest
      .fn()
      .mockResolvedValue({ id: 'u-1', username: 'john', email: 'a@b.c' }),
    verify_user: jest.fn().mockResolvedValue({
      accessToken: 'at',
      refreshToken: 'rt',
    }),
    findById: jest.fn().mockResolvedValue({
      id: 'u-1',
      username: 'john',
      email: 'a@b.c',
      created_at: new Date(),
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = await createTestingApp(module);
  });

  afterAll(() => app.close());

  it('POST /api/users/create → 201', () =>
    request(app.getHttpServer())
      .post('/api/users/create')
      .send({ username: 'john', email: 'a@b.c', password: 'pass1234' })
      .expect(201)
      .expect(({ body }) => expect(body.id).toBe('u-1')));

  it('POST /api/users/verify → 200 & sets cookie', () =>
    request(app.getHttpServer())
      .post('/api/users/verify')
      .send({ email: 'a@b.c', password: 'pass1234' })
      .expect(200)
      .expect('set-cookie', /refresh_token/));
});
