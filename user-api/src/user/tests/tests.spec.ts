import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from '../controller/controllers';
import { UserService } from '../services/services';
import { User, Credential } from '../models/models';
import { RegisterUserDto } from '../DTOs/DTOs';
import { ConflictException } from '@nestjs/common';

describe('User Module Tests', () => {
  describe('UserService', () => {
    let service: UserService;
    let userRepository: Repository<User>;
    let credentialRepository: Repository<Credential>;

    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockCredentialRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getRepositoryToken(User),
            useValue: mockUserRepository,
          },
          {
            provide: getRepositoryToken(Credential),
            useValue: mockCredentialRepository,
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
      credentialRepository = module.get<Repository<Credential>>(getRepositoryToken(Credential));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('registerUser', () => {
      it('should register a new user successfully', async () => {
        const registerUserDto = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          is_private: false,
        };

        mockUserRepository.findOne.mockResolvedValue(null);
        mockCredentialRepository.create.mockReturnValue({
          id: 'credential-id',
          password_hash: 'hashed_password',
        });
        mockCredentialRepository.save.mockResolvedValue({
          id: 'credential-id',
          password_hash: 'hashed_password',
        });
        mockUserRepository.create.mockReturnValue({
          id: 'user-id',
          email: registerUserDto.email,
          username: registerUserDto.username,
          is_private: registerUserDto.is_private,
          credential_id: 'credential-id',
        });
        mockUserRepository.save.mockResolvedValue({
          id: 'user-id',
          email: registerUserDto.email,
          username: registerUserDto.username,
          is_private: registerUserDto.is_private,
          credential_id: 'credential-id',
          created_at: new Date(),
          updated_at: new Date(),
        });

        const result = await service.registerUser(registerUserDto);

        expect(result).toBeDefined();
        expect(result.email).toBe(registerUserDto.email);
        expect(result.username).toBe(registerUserDto.username);
        expect(result.is_private).toBe(registerUserDto.is_private);
        expect(result.credential_id).toBe('credential-id');
      });

      it('should throw ConflictException if user already exists', async () => {
        const registerUserDto = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        };

        mockUserRepository.findOne.mockResolvedValue({
          id: 'existing-user-id',
          email: registerUserDto.email,
        });

        await expect(service.registerUser(registerUserDto)).rejects.toThrow(ConflictException);
      });

      it('should set default is_private to false if not provided', async () => {
        const registerUserDto = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        };

        mockUserRepository.findOne.mockResolvedValue(null);
        mockCredentialRepository.create.mockReturnValue({
          id: 'credential-id',
          password_hash: 'hashed_password',
        });
        mockCredentialRepository.save.mockResolvedValue({
          id: 'credential-id',
          password_hash: 'hashed_password',
        });
        mockUserRepository.create.mockReturnValue({
          id: 'user-id',
          email: registerUserDto.email,
          username: registerUserDto.username,
          is_private: false,
          credential_id: 'credential-id',
        });
        mockUserRepository.save.mockResolvedValue({
          id: 'user-id',
          email: registerUserDto.email,
          username: registerUserDto.username,
          is_private: false,
          credential_id: 'credential-id',
          created_at: new Date(),
          updated_at: new Date(),
        });

        const result = await service.registerUser(registerUserDto);

        expect(result.is_private).toBe(false);
      });
    });

    describe('getUserById', () => {
      it('should return user when found', async () => {
        const mockUser = {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          is_private: false,
          credential_id: 'credential-id',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockUserRepository.findOne.mockResolvedValue(mockUser);

        const result = await service.getUserById('user-id');

        expect(result).toBeDefined();
        expect(result[0].id).toBe(mockUser.id);
        expect(result[0].email).toBe(mockUser.email);
      });

      it('should return empty array when user not found', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);

        const result = await service.getUserById('non-existent-id');

        expect(result).toEqual([]);
      });
    });

    describe('getCredentialByUserId', () => {
      it('should return credential when found', async () => {
        const mockCredential = {
          id: 'credential-id',
          password_hash: 'hashed_password',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockUserRepository.findOne.mockResolvedValue({
          id: 'user-id',
          credential: Promise.resolve(mockCredential),
        });

        const result = await service.getCredentialByUserId('user-id');

        expect(result).toBeDefined();
        expect(result[0].id).toBe(mockCredential.id);
        expect(result[0].password_hash).toBe(mockCredential.password_hash);
      });

      it('should return empty array when user not found', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);

        const result = await service.getCredentialByUserId('non-existent-id');

        expect(result).toEqual([]);
      });

      it('should return empty array when credential not found', async () => {
        mockUserRepository.findOne.mockResolvedValue({
          id: 'user-id',
          credential: Promise.resolve(null),
        });

        const result = await service.getCredentialByUserId('user-id');

        expect(result).toEqual([]);
      });
    });
  });

  describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUserService = {
      registerUser: jest.fn(),
      getUserById: jest.fn(),
      getCredentialByUserId: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          {
            provide: UserService,
            useValue: mockUserService,
          },
        ],
      }).compile();

      controller = module.get<UserController>(UserController);
      service = module.get<UserService>(UserService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('registerUser', () => {
      it('should register a new user successfully', async () => {
        const registerUserDto = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          is_private: false,
        };

        const expectedResponse = {
          id: 'user-id',
          email: registerUserDto.email,
          username: registerUserDto.username,
          is_private: registerUserDto.is_private,
          credential_id: 'credential-id',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockUserService.registerUser.mockResolvedValue(expectedResponse);

        const result = await controller.registerUser(registerUserDto);

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResponse);
        expect(service.registerUser).toHaveBeenCalledWith(registerUserDto);
      });
    });

    describe('getUserById', () => {
      it('should return user when found', async () => {
        const mockUser = {
          id: 'user-id',
          email: 'test@example.com',
          username: 'testuser',
          is_private: false,
          credential_id: 'credential-id',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockUserService.getUserById.mockResolvedValue([mockUser]);

        const result = await controller.getUserById('user-id');

        expect(result).toBeDefined();
        expect(result).toEqual([mockUser]);
        expect(service.getUserById).toHaveBeenCalledWith('user-id');
      });

      it('should return empty array when user not found', async () => {
        mockUserService.getUserById.mockResolvedValue([]);

        const result = await controller.getUserById('non-existent-id');

        expect(result).toEqual([]);
        expect(service.getUserById).toHaveBeenCalledWith('non-existent-id');
      });
    });

    describe('getCredentialByUserId', () => {
      it('should return credential when found', async () => {
        const mockCredential = {
          id: 'credential-id',
          password_hash: 'hashed_password',
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockUserService.getCredentialByUserId.mockResolvedValue([mockCredential]);

        const result = await controller.getCredentialByUserId('user-id');

        expect(result).toBeDefined();
        expect(result).toEqual([mockCredential]);
        expect(service.getCredentialByUserId).toHaveBeenCalledWith('user-id');
      });

      it('should return empty array when user not found', async () => {
        mockUserService.getCredentialByUserId.mockResolvedValue([]);

        const result = await controller.getCredentialByUserId('non-existent-id');

        expect(result).toEqual([]);
        expect(service.getCredentialByUserId).toHaveBeenCalledWith('non-existent-id');
      });

      it('should return empty array when user has no credential', async () => {
        mockUserService.getCredentialByUserId.mockResolvedValue([]);

        const result = await controller.getCredentialByUserId('user-without-credential');

        expect(result).toEqual([]);
        expect(service.getCredentialByUserId).toHaveBeenCalledWith('user-without-credential');
      });
    });
  });
}); 