import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/controllers';
import { UserService } from './services/services';
import { User, Credential } from './models/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Credential]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {} 