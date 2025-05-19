import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Credential } from '../models/models';
import { RegisterUserDto } from '../DTOs/DTOs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    // Hash the password
    const password_hash = await bcrypt.hash(registerUserDto.password, 10);

    // Create the user entity
    const user = this.userRepository.create({
      email: registerUserDto.email,
      username: registerUserDto.username,
      is_private: registerUserDto.is_private ?? false,
    });
    const savedUser = await this.userRepository.save(user);

    // Create the credential entity
    const credential = this.credentialRepository.create({
      password_hash,
      user_id: savedUser.id,
    });
    const savedCredential = await this.credentialRepository.save(credential);

    // Update user with credential_id
    savedUser.credential_id = savedCredential.id;
    await this.userRepository.save(savedUser);

    // Attach credential to user for return (optional)
    savedUser.credential = savedCredential;
    return savedUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getCredentialByUserId(userId: string): Promise<Credential> {
    const credential = await this.credentialRepository.findOne({
      where: { user_id: userId },
    });

    if (!credential) {
      throw new NotFoundException(`Credential not found for user ${userId}`);
    }

    return credential;
  }
}
