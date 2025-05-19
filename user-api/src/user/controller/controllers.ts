import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from '../services/services';
import { RegisterUserDto, UserResponseDto, CredentialResponseDto } from '../DTOs/DTOs';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerUser(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.userService.registerUser(registerUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto[]> {
    return this.userService.getUserById(id);
  }

  @Get(':id/credential')
  async getCredentialByUserId(@Param('id') id: string): Promise<CredentialResponseDto[]> {
    return this.userService.getCredentialByUserId(id);
  }
}
