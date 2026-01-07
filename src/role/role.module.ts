import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../database/entities/role.entity';
import { UserEntity } from '../database/entities/user.entity';
import { PermissionEntity } from '../database/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, UserEntity, PermissionEntity]),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
