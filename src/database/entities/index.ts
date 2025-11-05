import { CategoryEntity } from './category.entity';
import { CompanyUserEntity } from './company-user.entity';
import { CompanyEntity } from './company.entity';
import { FeatureEntity } from './feature.entity';
import { GroupEntity } from './group.entity';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';
import { ServiceEntity } from './service.entity';
import { UserGroupEntity } from './user-group.entity';
import { UserEntity } from './user.entity';
import { UserProvider } from './userProvider.entity';

const entities = [
  UserEntity,
  UserProvider,
  CompanyEntity,
  CompanyUserEntity,
  CategoryEntity,
  GroupEntity,
  UserGroupEntity,
  ServiceEntity,
  FeatureEntity,
  RoleEntity,
  PermissionEntity,
];

export default entities;
