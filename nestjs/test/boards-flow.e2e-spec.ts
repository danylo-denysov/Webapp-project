import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';

describe('Board Management Flow (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let boardId: string;
  let secondUserId: string;
  let otherUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply cookie parser (required for authentication)
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Set global prefix to match main.ts
    app.setGlobalPrefix('api');

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Create and login first user
    const userEmail = `board-user-${Date.now()}@example.com`;
    const userPassword = 'BoardUser123!';

    const createUserResponse = await request(app.getHttpServer())
      .post('/api/users/create')
      .send({
        username: `boarduser-${Date.now()}`,
        email: userEmail,
        password: userPassword,
      });

    userId = createUserResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/api/users/verify')
      .send({
        email: userEmail,
        password: userPassword,
      });

    const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
    const accessTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith('access_token='),
    );
    accessToken = accessTokenCookie!.split(';')[0];

    // Create second user for member tests
    const secondUserResponse = await request(app.getHttpServer())
      .post('/api/users/create')
      .send({
        username: `seconduser-${Date.now()}`,
        email: `second-${Date.now()}@example.com`,
        password: 'SecondUser123!',
      });

    secondUserId = secondUserResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup will be handled by global teardown
    if (app) {
      await app.close();
    }
  });

  describe('Complete Board Workflow', () => {
    it('should create a new board', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/boards/user')
        .set('Cookie', [accessToken])
        .send({
          name: 'Project Alpha',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Project Alpha');
      expect(response.body.owner.id).toBe(userId);

      boardId = response.body.id;
    });

    it('should get all boards for the user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/boards/user')
        .set('Cookie', [accessToken])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((board: any) => board.id === boardId)).toBe(
        true,
      );
    });

    it('should get specific board by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}/user`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(response.body.id).toBe(boardId);
      expect(response.body.name).toBe('Project Alpha');
    });

    it('should update board name', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/user`)
        .set('Cookie', [accessToken])
        .send({
          name: 'Project Alpha - Updated',
        })
        .expect(200);

      expect(response.body.name).toBe('Project Alpha - Updated');
    });

    it('should add a member to the board', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/users/${secondUserId}`)
        .set('Cookie', [accessToken])
        .send({
          role: 'Editor',
        })
        .expect(201);

      // Verify member was added
      const usersResponse = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}/users`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(Array.isArray(usersResponse.body)).toBe(true);
      expect(
        usersResponse.body.some(
          (bu: any) => bu.user.id === secondUserId,
        ),
      ).toBe(true);
    });

    it('should create task groups in the board', async () => {
      const taskGroups = ['To Do', 'In Progress', 'Done'];
      const createdGroups: any[] = [];

      for (const groupName of taskGroups) {
        const response = await request(app.getHttpServer())
          .post(`/api/boards/${boardId}/task-groups`)
          .set('Cookie', [accessToken])
          .send({
            name: groupName,
          })
          .expect(201);

        expect(response.body.name).toBe(groupName);
        createdGroups.push(response.body);
      }

      // Verify all groups were created
      const boardResponse = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}/user`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(boardResponse.body.taskGroups.length).toBe(3);
    });

    it('should remove member from the board', async () => {
      await request(app.getHttpServer())
        .delete(`/api/boards/${boardId}/users/${secondUserId}`)
        .set('Cookie', [accessToken])
        .expect(204);

      // Verify member was removed
      const usersResponse = await request(app.getHttpServer())
        .get(`/api/boards/${boardId}/users`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(
        usersResponse.body.some(
          (bu: any) => bu.user.id === secondUserId,
        ),
      ).toBe(false);
    });
  });

  describe('Board Access Control', () => {
    let otherUserToken: string;

    beforeAll(async () => {
      // Create another user who is NOT a member
      const otherUserResponse = await request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: `otheruser-${Date.now()}`,
          email: `other-${Date.now()}@example.com`,
          password: 'OtherUser123!',
        });

      otherUserId = otherUserResponse.body.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: otherUserResponse.body.email,
          password: 'OtherUser123!',
        });

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token='),
      );
      otherUserToken = accessTokenCookie!.split(';')[0];
    });

    it('should not allow non-member to access board', async () => {
      await request(app.getHttpServer())
        .get(`/api/boards/${boardId}/user`)
        .set('Cookie', [otherUserToken])
        .expect(403);
    });

    it('should not allow non-member to update board', async () => {
      await request(app.getHttpServer())
        .patch(`/api/boards/${boardId}/user`)
        .set('Cookie', [otherUserToken])
        .send({
          name: 'Hacked Board Name',
        })
        .expect(404); // Board not found for users without access
    });

    it('should not allow non-member to add members', async () => {
      await request(app.getHttpServer())
        .post(`/api/boards/${boardId}/users/${secondUserId}`)
        .set('Cookie', [otherUserToken])
        .send({
          role: 'Editor',
        })
        .expect(401); // Unauthorized - only board members can add users
    });

    it('should require authentication to create board', async () => {
      await request(app.getHttpServer())
        .post('/api/boards/user')
        .send({
          name: 'Unauthorized Board',
        })
        .expect(401);
    });
  });

  describe('Board Deletion', () => {
    let tempBoardId: string;

    beforeAll(async () => {
      // Create a temporary board to delete
      const response = await request(app.getHttpServer())
        .post('/api/boards/user')
        .set('Cookie', [accessToken])
        .send({
          name: 'Temporary Board',
        });

      tempBoardId = response.body.id;
    });

    it('should delete board', async () => {
      await request(app.getHttpServer())
        .delete(`/api/boards/${tempBoardId}/user`)
        .set('Cookie', [accessToken])
        .expect(204);

      // Verify board was deleted
      await request(app.getHttpServer())
        .get(`/api/boards/${tempBoardId}/user`)
        .set('Cookie', [accessToken])
        .expect(404);
    });
  });
});
