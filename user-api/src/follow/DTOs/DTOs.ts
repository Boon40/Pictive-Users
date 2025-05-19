import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsUUID()
  @IsNotEmpty()
  follower_id: string;

  @IsUUID()
  @IsNotEmpty()
  followed_id: string;
}

export class DeleteFollowDto {
  @IsUUID()
  @IsNotEmpty()
  follower_id: string;

  @IsUUID()
  @IsNotEmpty()
  followed_id: string;
}

export class FollowResponseDto {
  id: string;
  follower_id: string;
  followed_id: string;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}
