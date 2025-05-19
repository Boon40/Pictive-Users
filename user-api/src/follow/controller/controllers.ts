import { Controller, Post, Delete, Body, Param, NotFoundException, ConflictException, Get } from '@nestjs/common';
import { FollowService } from '../services/services';
import { CreateFollowDto, DeleteFollowDto, FollowResponseDto } from '../DTOs/DTOs';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async createFollow(@Body() createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
    return this.followService.createFollow(createFollowDto);
  }

  @Delete()
  async deleteFollow(@Body() deleteFollowDto: DeleteFollowDto): Promise<void> {
    await this.followService.deleteFollow(deleteFollowDto);
  }

  @Post(':id/approve')
  async approveFollow(@Param('id') id: string): Promise<FollowResponseDto> {
    return this.followService.approveFollow(id);
  }

  @Get('/user/:followed_id')
  async getFollowsByFollowedId(@Param('followed_id') followed_id: string): Promise<FollowResponseDto[]> {
    return this.followService.getFollowsByFollowedId(followed_id);
  }
}
