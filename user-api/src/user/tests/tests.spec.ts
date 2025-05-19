import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from '../controller/controllers';
import { UserService } from '../services/services';
import { User, Credential } from '../models/models';
import { RegisterUserDto } from '../DTOs/DTOs';
import { NotFoundException } from '@nestjs/common';

describe('User Module', () => {
  // Mock data
  const mockCredential = {
    id: 'cred-1',
    password_hash: 'hashed_password',
    user_id: 'user-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    is_private: false,
    created_at: new Date(),
    updated_at: new Date(),
    credential_id: 'cred-1',
    credential: mockCredential,
  };

  // Test Suites
  describe('User Registration', () => {
    let service: UserService;
    let controller: UserController;
    let userRepository: Repository<User>;
    let credentialRepository: Repository<Credential>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              create: jest.fn().mockReturnValue(mockUser),
              save: jest.fn().mockResolvedValue(mockUser),
              findOne: jest.fn().mockResolvedValue(mockUser),
            },
          },
          {
            provide: getRepositoryToken(Credential),
            useValue: {
              create: jest.fn().mockReturnValue(mockCredential),
              save: jest.fn().mockResolvedValue(mockCredential),
              findOne: jest.fn().mockResolvedValue(mockCredential),
            },
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      controller = module.get<UserController>(UserController);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
      credentialRepository = module.get<Repository<Credential>>(getRepositoryToken(Credential));
    });

    const registerDto: RegisterUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      is_private: false,
    };

    describe('Service Layer', () => {
      it('should successfully register a new user', async () => {
        const result = await service.registerUser(registerDto);

        expect(result).toBeDefined();
        expect(result.email).toBe(registerDto.email);
        expect(result.username).toBe(registerDto.username);
        expect(result.is_private).toBe(registerDto.is_private);
        expect(userRepository.create).toHaveBeenCalled();
        expect(userRepository.save).toHaveBeenCalled();
        expect(credentialRepository.create).toHaveBeenCalled();
        expect(credentialRepository.save).toHaveBeenCalled();
      });

      it('should handle registration with default is_private value', async () => {
        const dtoWithoutPrivate = { ...registerDto };
        delete dtoWithoutPrivate.is_private;

        const result = await service.registerUser(dtoWithoutPrivate);

        expect(result.is_private).toBe(false);
      });

      it('should handle registration with is_private set to true', async () => {
        const dtoWithPrivate = { ...registerDto, is_private: true };
        jest.spyOn(userRepository, 'create').mockReturnValue({ ...mockUser, is_private: true });
        jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, is_private: true });

        const result = await service.registerUser(dtoWithPrivate);

        expect(result.is_private).toBe(true);
      });
    });

    describe('Controller Layer', () => {
      it('should successfully register a user and return UserResponseDto', async () => {
        jest.spyOn(service, 'registerUser').mockResolvedValue(mockUser);

        const result = await controller.registerUser(registerDto);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email', registerDto.email);
        expect(result).toHaveProperty('username', registerDto.username);
        expect(result).toHaveProperty('is_private', registerDto.is_private);
        expect(result).toHaveProperty('created_at');
        expect(result).toHaveProperty('updated_at');
        expect(service.registerUser).toHaveBeenCalledWith(registerDto);
      });

      it('should handle registration with default is_private value', async () => {
        const dtoWithoutPrivate = { ...registerDto };
        delete dtoWithoutPrivate.is_private;
        jest.spyOn(service, 'registerUser').mockResolvedValue({ ...mockUser, is_private: false });

        const result = await controller.registerUser(dtoWithoutPrivate);

        expect(result.is_private).toBe(false);
      });
    });
  });

  describe('User Retrieval', () => {
    let service: UserService;
    let controller: UserController;
    let userRepository: Repository<User>;
    let credentialRepository: Repository<Credential>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest.fn().mockResolvedValue(mockUser),
            },
          },
          {
            provide: getRepositoryToken(Credential),
            useValue: {
              findOne: jest.fn().mockResolvedValue(mockCredential),
            },
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      controller = module.get<UserController>(UserController);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
      credentialRepository = module.get<Repository<Credential>>(getRepositoryToken(Credential));
    });

    describe('Service Layer', () => {
      it('should return a user when found', async () => {
        const result = await service.getUserById('user-1');

        expect(result).toBeDefined();
        expect(result?.id).toBe('user-1');
        expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      });

      it('should return null when user not found', async () => {
        jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

        const result = await service.getUserById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('Controller Layer', () => {
      it('should return a user when found', async () => {
        jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

        const result = await controller.getUserById('user-1');

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id', 'user-1');
        expect(result).toHaveProperty('email', mockUser.email);
        expect(result).toHaveProperty('username', mockUser.username);
        expect(service.getUserById).toHaveBeenCalledWith('user-1');
      });

      it('should throw NotFoundException when user not found', async () => {
        jest.spyOn(service, 'getUserById').mockResolvedValue(null);

        await expect(controller.getUserById('non-existent')).rejects.toThrow(NotFoundException);
      });

      it('should transform User to UserResponseDto correctly', async () => {
        jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

        const result = await controller.getUserById('user-1');

        expect(result).not.toHaveProperty('credential');
        expect(result).not.toHaveProperty('credential_id');
      });
    });
  });

  describe('Credential Retrieval', () => {
    let service: UserService;
    let controller: UserController;
    let userRepository: Repository<User>;
    let credentialRepository: Repository<Credential>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: {
              findOne: jest.fn().mockResolvedValue(mockUser),
            },
          },
          {
            provide: getRepositoryToken(Credential),
            useValue: {
              findOne: jest.fn().mockResolvedValue(mockCredential),
            },
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      controller = module.get<UserController>(UserController);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
      credentialRepository = module.get<Repository<Credential>>(getRepositoryToken(Credential));
    });

    describe('Service Layer', () => {
      it('should return a credential when found', async () => {
        const result = await service.getCredentialByUserId('user-1');

        expect(result).toBeDefined();
        expect(result.user_id).toBe('user-1');
        expect(credentialRepository.findOne).toHaveBeenCalledWith({
          where: { user_id: 'user-1' },
        });
      });

      it('should throw NotFoundException when credential not found', async () => {
        jest.spyOn(credentialRepository, 'findOne').mockResolvedValueOnce(null);

        await expect(service.getCredentialByUserId('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('Controller Layer', () => {
      it('should return a credential when found', async () => {
        jest.spyOn(service, 'getCredentialByUserId').mockResolvedValue(mockCredential);

        const result = await controller.getCredentialByUserId('user-1');

        expect(result).toBeDefined();
        expect(result).toHaveProperty('id', 'cred-1');
        expect(result).toHaveProperty('user_id', 'user-1');
        expect(result).toHaveProperty('created_at');
        expect(result).toHaveProperty('updated_at');
        expect(service.getCredentialByUserId).toHaveBeenCalledWith('user-1');
      });

      it('should throw NotFoundException when credential not found', async () => {
        jest.spyOn(service, 'getCredentialByUserId').mockRejectedValue(
          new NotFoundException('Credential not found'),
        );

        await expect(controller.getCredentialByUserId('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should transform Credential to CredentialResponseDto correctly', async () => {
        jest.spyOn(service, 'getCredentialByUserId').mockResolvedValue(mockCredential);

        const result = await controller.getCredentialByUserId('user-1');

        expect(result).not.toHaveProperty('password_hash');
      });
    });
  });
}); 