import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../models/models';
import { User } from '../../user/models/models';
import { CreateFollowDto, DeleteFollowDto, FollowResponseDto } from '../DTOs/DTOs';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createFollow(createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
    const { follower_id, followed_id } = createFollowDto;

    // Check if follow already exists
    const existingFollow = await this.followRepository.findOne({
      where: { follower_id, followed_id },
    });

    if (existingFollow) {
      throw new ConflictException('Follow relationship already exists');
    }

    // Check if users exist
    const [follower, followed] = await Promise.all([
      this.userRepository.findOne({ where: { id: follower_id } }),
      this.userRepository.findOne({ where: { id: followed_id } }),
    ]);

    if (!follower || !followed) {
      throw new NotFoundException('One or both users not found');
    }

    // Create follow with auto-approval based on privacy settings
    const follow = this.followRepository.create({
      follower_id,
      followed_id,
      is_approved: !followed.is_private,
    });

    const savedFollow = await this.followRepository.save(follow);
    return {
      id: savedFollow.id,
      follower_id: savedFollow.follower_id,
      followed_id: savedFollow.followed_id,
      is_approved: savedFollow.is_approved,
      created_at: savedFollow.created_at,
      updated_at: savedFollow.updated_at,
    };
  }

  async deleteFollow(deleteFollowDto: DeleteFollowDto): Promise<void> {
    const { follower_id, followed_id } = deleteFollowDto;

    const follow = await this.followRepository.findOne({
      where: { follower_id, followed_id },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }

  async approveFollow(id: string): Promise<FollowResponseDto> {
    const follow = await this.followRepository.findOne({
      where: { id },
    });

    if (!follow) {
      throw new NotFoundException('Follow request not found');
    }

    if (follow.is_approved) {
      throw new ConflictException('Follow request is already approved');
    }

    follow.is_approved = true;
    const savedFollow = await this.followRepository.save(follow);
    return {
      id: savedFollow.id,
      follower_id: savedFollow.follower_id,
      followed_id: savedFollow.followed_id,
      is_approved: savedFollow.is_approved,
      created_at: savedFollow.created_at,
      updated_at: savedFollow.updated_at,
    };
  }

  async getFollowsByFollowedId(followed_id: string): Promise<FollowResponseDto[]> {
    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { id: followed_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${followed_id} not found`);
    }

    const follows = await this.followRepository.find({
      where: { followed_id },
      relations: ['follower', 'followed'],
    });

    return follows.map(follow => ({
      id: follow.id,
      follower_id: follow.follower_id,
      followed_id: follow.followed_id,
      is_approved: follow.is_approved,
      created_at: follow.created_at,
      updated_at: follow.updated_at,
    }));
  }
}
