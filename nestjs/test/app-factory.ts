import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../src/users/jwt-auth.guard';
import { JwtRefreshGuard } from '../src/users/jwt-refresh.guard';

// Helper that spins up any module and stubs JwtAuthGuard to "always true".
export async function createTestingApp<T>(
  rootModule: Type<T>,
): Promise<INestApplication> {
  const module = await Test.createTestingModule({ imports: [rootModule] })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(JwtRefreshGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = module.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();
  return app;
}
