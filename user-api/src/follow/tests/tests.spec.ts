import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowController } from '../controller/controllers';
import { FollowService } from '../services/services';
import { Follow } from '../models/models';
import { User } from '../../user/models/models';
import { CreateFollowDto, DeleteFollowDto } from '../DTOs/DTOs';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('Follow Module Tests', () => {
  describe('FollowService', () => {
    let service: FollowService;
    let followRepository: Repository<Follow>;
    let userRepository: Repository<User>;

    const mockFollowRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FollowService,
          {
            provide: getRepositoryToken(Follow),
            useValue: mockFollowRepository,
          },
          {
            provide: getRepositoryToken(User),
            useValue: mockUserRepository,
          },
        ],
      }).compile();

      service = module.get<FollowService>(FollowService);
      followRepository = module.get<Repository<Follow>>(getRepositoryToken(Follow));
      userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createFollow', () => {
      it('should create a follow relationship successfully', async () => {
        const createFollowDto: CreateFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowRepository.findOne.mockResolvedValue(null);
        mockUserRepository.findOne.mockResolvedValue({ id: 'follower-id', is_private: false });
        mockFollowRepository.create.mockReturnValue({
          id: 'follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
          is_approved: true,
        });
        mockFollowRepository.save.mockResolvedValue({
          id: 'follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
          is_approved: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

        const result = await service.createFollow(createFollowDto);

        expect(result).toBeDefined();
        expect(result.follower_id).toBe(createFollowDto.follower_id);
        expect(result.followed_id).toBe(createFollowDto.followed_id);
        expect(result.is_approved).toBe(true);
      });

      it('should throw ConflictException if follow already exists', async () => {
        const createFollowDto: CreateFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowRepository.findOne.mockResolvedValue({
          id: 'existing-follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
        });

        await expect(service.createFollow(createFollowDto)).rejects.toThrow(ConflictException);
      });

      it('should create unapproved follow for private users', async () => {
        const createFollowDto: CreateFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowRepository.findOne.mockResolvedValue(null);
        mockUserRepository.findOne.mockResolvedValue({ id: 'followed-id', is_private: true });
        mockFollowRepository.create.mockReturnValue({
          id: 'follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
          is_approved: false,
        });
        mockFollowRepository.save.mockResolvedValue({
          id: 'follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
          is_approved: false,
          created_at: new Date(),
          updated_at: new Date(),
        });

        const result = await service.createFollow(createFollowDto);

        expect(result.is_approved).toBe(false);
      });
    });

    describe('deleteFollow', () => {
      it('should delete follow relationship successfully', async () => {
        const deleteFollowDto: DeleteFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowRepository.findOne.mockResolvedValue({
          id: 'follow-id',
          follower_id: deleteFollowDto.follower_id,
          followed_id: deleteFollowDto.followed_id,
        });

        await service.deleteFollow(deleteFollowDto);

        expect(mockFollowRepository.remove).toHaveBeenCalled();
      });

      it('should throw NotFoundException if follow does not exist', async () => {
        const deleteFollowDto: DeleteFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowRepository.findOne.mockResolvedValue(null);

        await expect(service.deleteFollow(deleteFollowDto)).rejects.toThrow(NotFoundException);
      });
    });

    describe('approveFollow', () => {
      it('should approve follow request successfully', async () => {
        const followId = 'follow-id';
        const mockFollow = {
          id: followId,
          follower_id: 'follower-id',
          followed_id: 'followed-id',
          is_approved: false,
        };

        mockFollowRepository.findOne.mockResolvedValue(mockFollow);
        mockFollowRepository.save.mockResolvedValue({
          ...mockFollow,
          is_approved: true,
          updated_at: new Date(),
        });

        const result = await service.approveFollow(followId);

        expect(result.is_approved).toBe(true);
      });

      it('should throw NotFoundException if follow does not exist', async () => {
        mockFollowRepository.findOne.mockResolvedValue(null);

        await expect(service.approveFollow('non-existent-id')).rejects.toThrow(NotFoundException);
      });

      it('should throw ConflictException if follow is already approved', async () => {
        const mockFollow = {
          id: 'follow-id',
          follower_id: 'follower-id',
          followed_id: 'followed-id',
          is_approved: true,
        };

        mockFollowRepository.findOne.mockResolvedValue(mockFollow);

        await expect(service.approveFollow('follow-id')).rejects.toThrow(ConflictException);
      });
    });

    describe('getFollowsByFollowedId', () => {
      it('should return follows when found', async () => {
        const followedId = 'followed-id';
        const mockFollows = [
          {
            id: 'follow-1',
            follower_id: 'follower-1',
            followed_id: followedId,
            is_approved: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'follow-2',
            follower_id: 'follower-2',
            followed_id: followedId,
            is_approved: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        mockUserRepository.findOne.mockResolvedValue({ id: followedId });
        mockFollowRepository.find.mockResolvedValue(mockFollows);

        const result = await service.getFollowsByFollowedId(followedId);

        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].followed_id).toBe(followedId);
        expect(result[1].followed_id).toBe(followedId);
      });

      it('should throw NotFoundException if user does not exist', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);

        await expect(service.getFollowsByFollowedId('non-existent-id')).rejects.toThrow(NotFoundException);
      });

      it('should return empty array when no follows exist', async () => {
        const followedId = 'followed-id';

        mockUserRepository.findOne.mockResolvedValue({ id: followedId });
        mockFollowRepository.find.mockResolvedValue([]);

        const result = await service.getFollowsByFollowedId(followedId);

        expect(result).toEqual([]);
      });
    });
  });

  describe('FollowController', () => {
    let controller: FollowController;
    let service: FollowService;

    const mockFollowService = {
      createFollow: jest.fn(),
      deleteFollow: jest.fn(),
      approveFollow: jest.fn(),
      getFollowsByFollowedId: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [FollowController],
        providers: [
          {
            provide: FollowService,
            useValue: mockFollowService,
          },
        ],
      }).compile();

      controller = module.get<FollowController>(FollowController);
      service = module.get<FollowService>(FollowService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('createFollow', () => {
      it('should create follow relationship successfully', async () => {
        const createFollowDto: CreateFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        const expectedResponse = {
          id: 'follow-id',
          follower_id: createFollowDto.follower_id,
          followed_id: createFollowDto.followed_id,
          is_approved: true,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockFollowService.createFollow.mockResolvedValue(expectedResponse);

        const result = await controller.createFollow(createFollowDto);

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResponse);
        expect(service.createFollow).toHaveBeenCalledWith(createFollowDto);
      });
    });

    describe('deleteFollow', () => {
      it('should delete follow relationship successfully', async () => {
        const deleteFollowDto: DeleteFollowDto = {
          follower_id: 'follower-id',
          followed_id: 'followed-id',
        };

        mockFollowService.deleteFollow.mockResolvedValue(undefined);

        await controller.deleteFollow(deleteFollowDto);

        expect(service.deleteFollow).toHaveBeenCalledWith(deleteFollowDto);
      });
    });

    describe('approveFollow', () => {
      it('should approve follow request successfully', async () => {
        const followId = 'follow-id';
        const expectedResponse = {
          id: followId,
          follower_id: 'follower-id',
          followed_id: 'followed-id',
          is_approved: true,
          created_at: new Date(),
          updated_at: new Date(),
        };

        mockFollowService.approveFollow.mockResolvedValue(expectedResponse);

        const result = await controller.approveFollow(followId);

        expect(result).toBeDefined();
        expect(result).toEqual(expectedResponse);
        expect(service.approveFollow).toHaveBeenCalledWith(followId);
      });
    });

    describe('getFollowsByFollowedId', () => {
      it('should return follows when found', async () => {
        const followedId = 'followed-id';
        const expectedFollows = [
          {
            id: 'follow-1',
            follower_id: 'follower-1',
            followed_id: followedId,
            is_approved: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'follow-2',
            follower_id: 'follower-2',
            followed_id: followedId,
            is_approved: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        mockFollowService.getFollowsByFollowedId.mockResolvedValue(expectedFollows);

        const result = await controller.getFollowsByFollowedId(followedId);

        expect(result).toBeDefined();
        expect(result).toEqual(expectedFollows);
        expect(service.getFollowsByFollowedId).toHaveBeenCalledWith(followedId);
      });

      it('should return empty array when no follows exist', async () => {
        const followedId = 'followed-id';

        mockFollowService.getFollowsByFollowedId.mockResolvedValue([]);

        const result = await controller.getFollowsByFollowedId(followedId);

        expect(result).toEqual([]);
        expect(service.getFollowsByFollowedId).toHaveBeenCalledWith(followedId);
      });
    });
  });
});
