import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { createMockRepo } from '../../test/mock-repository';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const userRepo = createMockRepo<User>();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('validate returns minimal user when found', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.c' } as any);
    const res = await strategy.validate({ sub: 'u1', email: 'a@b.c' });
    expect(res).toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('validate throws when user missing', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(
      strategy.validate({ sub: 'u1', email: 'a@b.c' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
