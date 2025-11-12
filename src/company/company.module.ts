import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { PermissionModule } from '../permission/permission.module';
import { ServiceEntity } from '../database/entities/service.entity';
import { FeatureEntity } from '../database/entities/feature.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      CompanyUserEntity,
      ServiceEntity,
      FeatureEntity,
    ]),
    PermissionModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
