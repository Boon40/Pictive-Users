import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/models/models';
import { Credential } from './user/models/models';
import { Follow } from './follow/models/models';
import { UserModule } from './user/user.module';
import { FollowModule } from './follow/follow.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'pictive_users',
      entities: [User, Credential, Follow],
      synchronize: true,
    }),
    UserModule,
    FollowModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
