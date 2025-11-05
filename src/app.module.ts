import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UserModule } from './user/user.module';
import { CredentialModule } from './credential/credential.module';
import { CompanyModule } from './company/company.module';
import { CategoryModule } from './category/category.module';
import { GroupModule } from './group/group.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    UserModule,
    CredentialModule,
    CompanyModule,
    CategoryModule,
    GroupModule,
    PermissionModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
