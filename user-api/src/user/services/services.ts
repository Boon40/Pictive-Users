import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Credential } from '../models/models';
import { RegisterUserDto, UserResponseDto, CredentialResponseDto } from '../DTOs/DTOs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const { email, username, password, is_private = false } = registerUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create credential
    const credential = this.credentialRepository.create({
      password_hash: hashedPassword,
    });

    // Save credential first to get its ID
    const savedCredential = await this.credentialRepository.save(credential);

    // Create user with credential_id
    const user = this.userRepository.create({
      email,
      username,
      is_private,
      credential_id: savedCredential.id,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Return user without sensitive data
    return {
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      is_private: savedUser.is_private,
      credential_id: savedUser.credential_id,
      created_at: savedUser.created_at,
      updated_at: savedUser.updated_at,
    };
  }

  async getUserById(id: string): Promise<UserResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['credential'],
    });

    if (!user) {
      return [];
    }

    return [{
      id: user.id,
      email: user.email,
      username: user.username,
      is_private: user.is_private,
      credential_id: user.credential_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }];
  }

  async getCredentialByUserId(userId: string): Promise<CredentialResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['credential'],
    });

    if (!user) {
      return [];
    }

    const credential = await user.credential;
    if (!credential) {
      return [];
    }

    return [{
      id: credential.id,
      password_hash: credential.password_hash,
      created_at: credential.created_at,
      updated_at: credential.updated_at,
    }];
  }
}
