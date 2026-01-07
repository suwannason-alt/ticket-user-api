import { Global, Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { ServiceEntity } from '../database/entities/service.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { CredentialModule } from '../credential/credential.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      CompanyUserEntity,
      ServiceEntity,
      FeatureEntity,
    ]),
    CredentialModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
