import { IsEmail, IsString, IsOptional, IsBoolean, MinLength, IsUUID } from 'class-validator';

export class RegisterUserDto {
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
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsBoolean()
  is_private: boolean;

  @IsUUID()
  credential_id: string;

  created_at: Date;
  updated_at: Date;
}

export class CredentialResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  password_hash: string;

  created_at: Date;
  updated_at: Date;
}
