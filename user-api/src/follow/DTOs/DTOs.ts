import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateFollowDto {
  @IsString()
  follower_id: string;

  @IsString()
  followed_id: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class FollowResponseDto {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: Date;
  isApproved: boolean;
}
