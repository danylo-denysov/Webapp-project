import { INestApplication, ExecutionContext, CanActivate } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

// run nest app from an already compiled TestingModule
// silence all auth guards for E2E requests.
export async function createTestingApp(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');

  class PassGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
      // inject a fake user so @GetUser() works
      ctx.switchToHttp().getRequest().user = {
        id: 'user-1',
        email: 'tester@example.com',
      };
      return true;
    }
  }
  app.useGlobalGuards(new PassGuard());

  await app.init();
  return app;
}
