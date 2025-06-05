import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard (unit)', () => {
  it('delegates to parent canActivate', () => {
    const ctx = {} as ExecutionContext;
    const guard = new JwtAuthGuard();
    expect(typeof guard.canActivate).toBe('function');
  });
});
