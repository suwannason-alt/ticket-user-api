import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../database/entities/category.entity';
import { Repository } from 'typeorm';
import { SaveAppLog } from '../utils/logger';
import { EStatus } from '../enum/category';

@Injectable()
export class CategoryService {
  private readonly logger = new SaveAppLog(CategoryService.name);
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async getCategory(company: string, page: number, limit: number) {
    try {
      const query = this.categoryRepository
        .createQueryBuilder(`c`)
        .where(`c.company_uuid = :company`, { company })
        .andWhere(`c.status = :status`, { status: EStatus.ACTIVE });

      const [data, count] = await Promise.all([
        query
          .offset((page - 1) * limit)
          .limit(limit)
          .select([`c.uuid AS uuid`, `c.name AS name`, `c.parent AS parent`])
          .getRawMany(),
        query.getCount(),
      ]);

      this.logger.log(`get category`, this.getCategory.name, { company });
      return { data, count };
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getCategory.name);
      throw new Error(error);
    }
  }
}
