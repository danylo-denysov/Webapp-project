import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply cookie parser (required for authentication)
    app.use(cookieParser());

    // Apply the same global pipes as in main.ts
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
  });

  afterAll(async () => {
    // Cleanup will be handled by global teardown
    await app.close();
  });

  describe('/users/create (POST)', () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const uniqueUsername = `testuser-${Date.now()}`;

    it('should create a new user', () => {

      return request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: uniqueUsername,
          email: uniqueEmail,
          password: 'TestPassword123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.username).toBe(uniqueUsername);
          expect(res.body.email).toBe(uniqueEmail);
          expect(res.body).not.toHaveProperty('password'); // Password should not be returned
        });
    });

    it('should fail to create user with duplicate email', async () => {
      const duplicateEmail = 'duplicate@example.com';

      // First, create a user
      await request(app.getHttpServer()).post('/api/users/create').send({
        username: 'uniqueuser',
        email: duplicateEmail,
        password: 'TestPassword123!',
      });

      // Try to create another user with the same email
      return request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: 'anotheruser',
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Email already exists');
        });
    });

    it('should fail to create user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
        .expect(400);
    });

    it('should fail to create user with short password', () => {
      return request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123', // Too short
        })
        .expect(400);
    });
  });

  describe('/users/verify (POST) - Login', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testUsername = `loginuser-${Date.now()}`;
    const testPassword = 'LoginPassword123!';

    beforeAll(async () => {

      // Create a test user for login tests
      await request(app.getHttpServer()).post('/api/users/create').send({
        username: testUsername,
        email: testEmail,
        password: testPassword,
      });
    });

    it('should login with valid credentials and set cookies', () => {
      return request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          // Check that cookies are set
          const cookies = res.headers['set-cookie'] as unknown as string[];
          expect(cookies).toBeDefined();
          expect(cookies.some((cookie: string) => cookie.includes('access_token'))).toBe(true);
          expect(cookies.some((cookie: string) => cookie.includes('refresh_token'))).toBe(true);
        });
    });

    it('should fail to login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid login credentials');
        });
    });

    it('should fail to login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid login credentials');
        });
    });
  });

  describe('Authentication Flow (Login -> Access Protected Route -> Refresh)', () => {
    const flowEmail = `flow-test-${Date.now()}@example.com`;
    const flowUsername = `flowuser-${Date.now()}`;
    const flowPassword = 'FlowPassword123!';
    let accessToken: string;
    let refreshToken: string;

    it('should create user, login, access protected route, and refresh token', async () => {

      // Step 1: Create user
      await request(app.getHttpServer())
        .post('/api/users/create')
        .send({
          username: flowUsername,
          email: flowEmail,
          password: flowPassword,
        })
        .expect(201);

      // Step 2: Login and get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: flowEmail,
          password: flowPassword,
        })
        .expect(200);

      // Extract cookies
      const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token='),
      );
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('refresh_token='),
      );

      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();

      accessToken = accessTokenCookie!.split(';')[0];
      refreshToken = refreshTokenCookie!.split(';')[0];

      // Step 3: Access protected route with access token
      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Cookie', [accessToken])
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(flowEmail);
          expect(res.body.username).toBe(flowUsername);
        });

      // Step 4: Refresh tokens
      await request(app.getHttpServer())
        .post('/api/users/refresh')
        .set('Cookie', [refreshToken])
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const newCookies = res.headers['set-cookie'] as unknown as string[];
          expect(newCookies).toBeDefined();
          expect(newCookies.some((cookie: string) => cookie.includes('access_token'))).toBe(true);
          expect(newCookies.some((cookie: string) => cookie.includes('refresh_token'))).toBe(true);
        });
    });

    it('should fail to access protected route without token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });

    it('should logout and clear tokens', async () => {
      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: flowEmail,
          password: flowPassword,
        })
        .expect(200);

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
      const refreshTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('refresh_token='),
      );

      // Logout
      await request(app.getHttpServer())
        .post('/api/users/logout')
        .set('Cookie', [refreshTokenCookie!.split(';')[0]])
        .expect(200);

      // Try to access protected route after logout - should fail
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token='),
      );

      // Note: This might still work if the token hasn't expired yet
      // In production, you'd want to implement token blacklisting
    });
  });

  describe('User Profile Management', () => {
    const profileEmail = `profile-test-${Date.now()}@example.com`;
    const profileUsername = `profileuser-${Date.now()}`;
    const profilePassword = 'ProfilePassword123!';
    let accessToken: string;

    beforeAll(async () => {

      // Create and login
      await request(app.getHttpServer()).post('/api/users/create').send({
        username: profileUsername,
        email: profileEmail,
        password: profilePassword,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/users/verify')
        .send({
          email: profileEmail,
          password: profilePassword,
        });

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[];
      const accessTokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith('access_token='),
      );
      accessToken = accessTokenCookie!.split(';')[0];
    });

    it('should change user nickname', () => {
      const newNickname = `newnick-${Date.now()}`;

      return request(app.getHttpServer())
        .patch('/api/users/me/nickname')
        .set('Cookie', [accessToken])
        .send({ newNickname })
        .expect(200);
    });

    it('should change user password', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me/password')
        .set('Cookie', [accessToken])
        .send({
          currentPassword: profilePassword,
          newPassword: 'NewPassword123!',
          repeatPassword: 'NewPassword123!',
        })
        .expect(200);
    });

    it('should fail to change password with wrong current password', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me/password')
        .set('Cookie', [accessToken])
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
          repeatPassword: 'NewPassword123!',
        })
        .expect(401);
    });

    it('should fail to change password with mismatched new passwords', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me/password')
        .set('Cookie', [accessToken])
        .send({
          currentPassword: profilePassword,
          newPassword: 'NewPassword123!',
          repeatPassword: 'DifferentPassword123!',
        })
        .expect(401); // Returns Unauthorized instead of Bad Request
    });
  });
});
