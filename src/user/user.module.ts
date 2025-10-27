import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { UserProvider } from '../database/entities/userProvider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserProvider])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
