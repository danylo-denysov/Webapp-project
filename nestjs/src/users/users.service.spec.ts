import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let emailService: EmailService;

  const mockUser: User = {
    id: 'uuid-1234',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    created_at: new Date(),
    profile_picture: null,
    current_hashed_refresh_token: null,
    boards: [],
  };

  const mockUsersRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);

    // Clear all mocks before each test
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          id: 'uuid-1',
          email: 'user1@example.com',
          username: 'user1',
          profile_picture: null,
        },
        {
          id: 'uuid-2',
          email: 'user2@example.com',
          username: 'user2',
          profile_picture: null,
        },
      ];

      mockUsersRepository.find.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(result).toEqual(users);
      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'username', 'profile_picture'],
      });
    });
  });

  describe('createUser', () => {
    const createUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
    };

    it('should successfully create a new user', async () => {
      const newUser = {
        id: 'new-uuid',
        username: createUserDto.username,
        email: createUserDto.email,
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue(newUser);
      mockUsersRepository.save.mockResolvedValue(newUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual({
        id: 'new-uuid',
        username: createUserDto.username,
        email: createUserDto.email,
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(2); // Check email and username
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser); // Email exists

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      mockUsersRepository.findOne
        .mockResolvedValueOnce(null) // Email doesn't exist
        .mockResolvedValueOnce(mockUser); // Username exists

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('verifyUser', () => {
    const verifyUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access and refresh tokens for valid credentials', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockConfigService.getOrThrow
        .mockReturnValueOnce('900') // JWT_ACCESS_TOKEN_TTL
        .mockReturnValueOnce('604800') // JWT_REFRESH_TOKEN_TTL
        .mockReturnValueOnce('access-secret') // JWT_SECRET
        .mockReturnValueOnce('refresh-secret'); // JWT_REFRESH_SECRET

      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-refresh-token' as never);

      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.verifyUser(verifyUserDto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: verifyUserDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        verifyUserDto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyUser(verifyUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyUser(verifyUserDto)).rejects.toThrow(
        'Invalid login credentials',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.verifyUser(verifyUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyUser(verifyUserDto)).rejects.toThrow(
        'Invalid login credentials',
      );
    });
  });

  describe('updateNickname', () => {
    it('should successfully update user nickname', async () => {
      const userId = 'uuid-1234';
      const newNickname = 'newNickname';

      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockUsersRepository.save.mockResolvedValue({
        ...mockUser,
        username: newNickname,
      });

      await service.updateNickname(userId, newNickname);

      expect(mockUsersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        username: newNickname,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateNickname('invalid-id', 'newNick')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if nickname already in use', async () => {
      const existingUser = { ...mockUser, id: 'different-id' };

      mockUsersRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      await expect(service.updateNickname('uuid-1234', 'takenNick')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change user password', async () => {
      const userId = 'uuid-1234';
      const currentPassword = 'oldPassword';
      const newPassword = 'newPassword123';
      const testUser = { ...mockUser }; // Create a copy to avoid mutation

      mockUsersRepository.findOne.mockResolvedValue(testUser);
      const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const genSaltSpy = jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword' as never);
      mockUsersRepository.save.mockResolvedValue(testUser);

      await service.changePassword(userId, currentPassword, newPassword, newPassword);

      expect(compareSpy).toHaveBeenCalledWith(currentPassword, 'hashedPassword');
      expect(genSaltSpy).toHaveBeenCalled();
      expect(hashSpy).toHaveBeenCalledWith(newPassword, 'salt');
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('invalid-id', 'old', 'new', 'new'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.changePassword('uuid-1234', 'wrongPassword', 'new', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if new passwords do not match', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        service.changePassword('uuid-1234', 'oldPassword', 'new1', 'new2'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword('uuid-1234', 'oldPassword', 'new1', 'new2'),
      ).rejects.toThrow('New passwords do not match');
    });
  });

  describe('deleteUserById', () => {
    it('should successfully delete user', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteUserById('uuid-1234');

      expect(mockUsersRepository.delete).toHaveBeenCalledWith('uuid-1234');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUsersRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteUserById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('uuid-1234');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1234' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchUsers', () => {
    it('should return users matching search query', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };

      mockUsersRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers('test');

      expect(result).toEqual([mockUser]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(user.username) LIKE LOWER(:query)',
        { query: '%test%' },
      );
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });
});
