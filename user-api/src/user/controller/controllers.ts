import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { UserService } from '../services/services';
import { RegisterUserDto, UserResponseDto, CredentialResponseDto } from '../DTOs/DTOs';
import { User } from '../models/models';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const user = await this.userService.registerUser(registerUserDto);
    return this.toResponseDto(user);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toResponseDto(user);
  }

  @Get(':id/credential')
  async getCredentialByUserId(@Param('id') id: string): Promise<CredentialResponseDto> {
    const credential = await this.userService.getCredentialByUserId(id);
    return this.toCredentialResponseDto(credential);
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      is_private: user.is_private,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private toCredentialResponseDto(credential: any): CredentialResponseDto {
    return {
      id: credential.id,
      created_at: credential.created_at,
      updated_at: credential.updated_at,
      user_id: credential.user_id,
    };
  }
}
