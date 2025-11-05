import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, CompanyUserEntity]),
    PermissionModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
