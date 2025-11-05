import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../database/entities/category.entity';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity]), PermissionModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
