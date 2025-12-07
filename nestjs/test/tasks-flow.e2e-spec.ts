import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';

describe('Task Management Flow (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let secondUserToken: string;
  let userId: string;
  let secondUserId: string;
  let outsiderId: string;
  let boardId: string;
  let taskGroupId: string;
  let taskId: string;

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

    // Create first user
    const userEmail = `task-user-${Date.now()}@example.com`;
    const userPassword = 'TaskUser123!';

    const createUserResponse = await request(app.getHttpServer())
      .post('/api/users/create')
      .send({
        username: `taskuser-${Date.now()}`,
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

    // Create second user
    const secondUserResponse = await request(app.getHttpServer())
      .post('/api/users/create')
      .send({
        username: `secondtaskuser-${Date.now()}`,
        email: `secondtask-${Date.now()}@example.com`,
        password: 'SecondTask123!',
      });

    secondUserId = secondUserResponse.body.id;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/api/users/verify')
      .send({
        email: secondUserResponse.body.email,
        password: 'SecondTask123!',
      });

    const secondCookies = secondLoginResponse.headers['set-cookie'] as unknown as string[];
    const secondAccessTokenCookie = secondCookies.find((cookie: string) =>
      cookie.startsWith('access_token='),
    );
    secondUserToken = secondAccessTokenCookie!.split(';')[0];

    // Create board
    const boardResponse = await request(app.getHttpServer())
      .post('/api/boards/user')
      .set('Cookie', [accessToken])
      .send({
        name: 'Task Management Board',
      });

    boardId = boardResponse.body.id;

    // Add second user to board
    await request(app.getHttpServer())
      .post(`/api/boards/${boardId}/users/${secondUserId}`)
      .set('Cookie', [accessToken])
      .send({
        role: 'Editor',
      })
      .expect(201);

    // Create task group
    const taskGroupResponse = await request(app.getHttpServer())
      .post(`/api/boards/${boardId}/task-groups`)
      .set('Cookie', [accessToken])
      .send({
        name: 'To Do',
      });

    taskGroupId = taskGroupResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup will be handled by global teardown
    if (app) {
      await app.close();
    }
  });

  describe('Task CRUD Operations', () => {
    it('should create a new task', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Cookie', [accessToken])
        .send({
          title: 'Implement authentication',
          description: 'Add JWT authentication to the API',
          groupId: taskGroupId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Implement authentication');
      expect(response.body.description).toBe('Add JWT authentication to the API');

      taskId = response.body.id;
    });

    it('should get all tasks in task group', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/group/${taskGroupId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some((task: any) => task.id === taskId)).toBe(true);
    });

    it('should get specific task by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Implement authentication');
    });

    it('should update task', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .send({
          title: 'Implement authentication - Updated',
          description: 'Add JWT and refresh token authentication',
        })
        .expect(200);

      expect(response.body.title).toBe('Implement authentication - Updated');
      expect(response.body.description).toBe(
        'Add JWT and refresh token authentication',
      );
    });
  });

  describe('Task Assignment Flow', () => {
    it('should assign user to task', async () => {
      await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/users/${secondUserId}`)
        .set('Cookie', [accessToken])
        .expect(204);

      // Verify assignment
      const taskResponse = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(
        taskResponse.body.users.some((user: any) => user.id === secondUserId),
      ).toBe(true);
    });

    it('should not allow assigning non-member to task', async () => {
      // Create a user who is not a board member
      const nonMemberResponse = await request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: `nonmember-${Date.now()}`,
          email: `nonmember-${Date.now()}@example.com`,
          password: 'NonMember123!',
        });

      // Should not allow assigning non-board members to tasks
      await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/users/${nonMemberResponse.body.id}`)
        .set('Cookie', [accessToken])
        .expect(403); // Forbidden - only board members can be assigned
    });

    it('should remove user from task', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}/users/${secondUserId}`)
        .set('Cookie', [accessToken])
        .expect(204);

      // Verify removal
      const taskResponse = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(
        taskResponse.body.users.some((user: any) => user.id === secondUserId),
      ).toBe(false);
    });
  });

  describe('Task Comments and Mentions', () => {
    it('should add comment to task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/comments`)
        .set('Cookie', [accessToken])
        .send({
          content: 'This task needs review',
        })
        .expect(201);

      expect(response.body.content).toBe('This task needs review');
      expect(response.body.user.id).toBe(userId);
    });

    it('should add comment with mention', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/comments`)
        .set('Cookie', [accessToken])
        .send({
          content: `@${secondUserToken.split('-')[0]} please check this task`,
        })
        .expect(201);

      expect(response.body.content).toContain('@');
    });

    it('should get all comments for task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      expect(response.body.comments).toBeDefined();
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.comments.length).toBeGreaterThan(0);
    });

    it('should delete comment', async () => {
      // First create a comment
      const createResponse = await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/comments`)
        .set('Cookie', [accessToken])
        .send({
          content: 'Comment to be deleted',
        });

      const commentId = createResponse.body.id;

      // Delete the comment
      await request(app.getHttpServer())
        .delete(`/api/tasks/comments/${commentId}`)
        .set('Cookie', [accessToken])
        .expect(204);
    });
  });

  describe('Task Lists (Checklists)', () => {
    let taskListId: string;

    it('should create task list', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/tasks/lists`)
        .set('Cookie', [accessToken])
        .send({
          taskId: taskId,
          name: 'Development Checklist',
        })
        .expect(201);

      expect(response.body.name).toBe('Development Checklist');
      taskListId = response.body.id;
    });

    it('should add items to task list', async () => {
      const items = [
        'Setup project structure',
        'Implement models',
        'Write tests',
      ];

      for (const content of items) {
        const response = await request(app.getHttpServer())
          .post(`/api/tasks/lists/items`)
          .set('Cookie', [accessToken])
          .send({
            taskListId: taskListId,
            content: content,
          })
          .expect(201);

        expect(response.body.content).toBe(content);
        expect(response.body.completed).toBe(false);
      }
    });

    it('should toggle checklist item completion', async () => {
      // Get task to find item ID
      const taskResponse = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(200);

      const taskList = taskResponse.body.taskLists.find(
        (list: any) => list.id === taskListId,
      );
      const itemId = taskList.items[0].id;
      const currentCompleted = taskList.items[0].completed;

      // Toggle completion
      const response = await request(app.getHttpServer())
        .patch(`/api/tasks/lists/items/${itemId}`)
        .set('Cookie', [accessToken])
        .send({
          completed: !currentCompleted,
        })
        .expect(200);

      expect(response.body.completed).toBe(!currentCompleted);
    });

    it('should delete task list', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/lists/${taskListId}`)
        .set('Cookie', [accessToken])
        .expect(204);
    });
  });

  describe('Task Access Control', () => {
    let outsiderToken: string;

    beforeAll(async () => {
      // Create user who is NOT a board member
      const outsiderResponse = await request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: `outsider-${Date.now()}`,
          email: `outsider-${Date.now()}@example.com`,
          password: 'Outsider123!',
        });

      outsiderId = outsiderResponse.body.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: outsiderResponse.body.email,
          password: 'Outsider123!',
        });

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token='),
      );
      outsiderToken = accessTokenCookie!.split(';')[0];
    });

    it('should not allow outsider to view task', async () => {
      await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [outsiderToken])
        .expect(403);
    });

    it('should not allow outsider to update task', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}`)
        .set('Cookie', [outsiderToken])
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });

    it('should not allow outsider to add comments', async () => {
      await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/comments`)
        .set('Cookie', [outsiderToken])
        .send({
          content: 'Unauthorized comment',
        })
        .expect(403);
    });
  });

  describe('Task Deletion', () => {
    it('should delete task', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set('Cookie', [accessToken])
        .expect(404);
    });
  });
});
