import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Credential } from './models/models';
import { UserService } from './services/services';
import { UserController } from './controller/controllers';

@Module({
  imports: [TypeOrmModule.forFeature([User, Credential])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {} 