import { IsEmail, IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  is_private?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  is_private?: boolean;
}

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  is_private: boolean;
  created_at: Date;
  updated_at: Date;
}
