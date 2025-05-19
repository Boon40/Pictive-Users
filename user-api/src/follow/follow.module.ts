import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowController } from './controller/controllers';
import { FollowService } from './services/services';
import { Follow } from './models/models';
import { User } from '../user/models/models';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {} 