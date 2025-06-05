import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { createMockRepo } from '../../test/mock-repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  const userRepo = createMockRepo<User>();
  const jwt = { sign: jest.fn().mockReturnValue('token') };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('create_user hashes password & saves', async () => {
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    userRepo.create.mockImplementation((x) => x as any);
    userRepo.save.mockResolvedValue({ id: 'u1' } as any);

    await service.create_user({
      username: 'john',
      email: 'a@b.c',
      password: 'pass1234',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('pass1234', 'salt');
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('verify_user bad email throws 401', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(
      service.verify_user({ email: 'x', password: 'y' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('change_password mismatching new passwords → 400', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 'u1',
      password: 'old',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.change_password('u1', 'old', 'new1', 'new2'),
    ).rejects.toThrow(BadRequestException);
  });

  it('update_nickname duplicate → 409', async () => {
    userRepo.findOne
      .mockResolvedValueOnce({ id: 'u1', username: '', email: '', password: '' } as any)
      .mockResolvedValueOnce({ id: 'u2', username: '', email: '', password: '' } as any);

    await expect(service.update_nickname('u1', 'dup')).rejects.toThrow(
      ConflictException,
    );
  });
});
