import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { RoleEntity } from '../database/entities/role.entity';
import { PermissionEntity } from '../database/entities/permission.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { ServiceEntity } from '../database/entities/service.entity';
import { SaveAppLog } from '../utils/logger';
import { EStatus } from '../enum/common';
import { CreatePermissionDto } from './dto/permission.dto';
import { ICurrentUser } from '../current-user/current-user.decorator';

@Injectable()
export class PermissionService {
  private readonly logger = new SaveAppLog(PermissionService.name);
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  baseQueryBuilder() {
    return this.permissionRepository
      .createQueryBuilder(`p`)
      .innerJoin(RoleEntity, `r`, `r.uuid = p.role_uuid`)
      .innerJoin(UserEntity, `u`, `u.role_uuid = r.uuid`)
      .innerJoin(FeatureEntity, `f`, `f.uuid = p.feature_uuid`)
      .innerJoin(ServiceEntity, `s`, `s.uuid = f.service_uuid`);
  }

  async readPermission(
    user_uuid: string,
    company_uuid: string,
    service: string,
    feature: string,
  ) {
    try {
      const query = this.baseQueryBuilder();
      query.where(`u.uuid = :user`, { user: user_uuid });
      query.andWhere(`r.status = :status`, { status: EStatus.ACTIVE });
      query.andWhere(
        new Brackets((qb) => {
          qb.where('r.company_uuid IS NULL').orWhere(
            'r.company_uuid = :company',
            { company: company_uuid },
          );
        }),
      );
      query
        .andWhere(`s.uuid = :service`, {
          service,
        })
        .useIndex('permissions_role_idx')
        .andWhere(`f.name = :feature`, { feature })
        .select([
          'u.uuid AS uuid',
          's.name AS service',
          'f.name AS feature',
          'p.permission AS permission',
        ]);
      const data = await query.getRawOne();
      return data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.readPermission.name);
      throw new Error(error);
    }
  }

  async createPermission(body: CreatePermissionDto, user: ICurrentUser) {
    try {
      const permissions: any = [];

      for (const permission of body.permissions) {
        permissions.push({
          role_uuid: body.role_uuid,
          feature_uuid: body.feature_uuid,
          createdBy: user.uuid,
          permission: {
            insert: permission.insert,
            update: permission.update,
            delete: permission.delete,
            view: permission.view,
          },
        });
      }
      await this.permissionRepository
        .createQueryBuilder()
        .insert()
        .into(PermissionEntity)
        .values(permissions)
        .execute();
      this.logger.log(
        `create permission completed`,
        this.createPermission.name,
      );
    } catch (error) {
      this.logger.error(error.message, error.stack, this.createPermission.name);
    }
  }
}
