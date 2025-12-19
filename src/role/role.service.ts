import { Injectable } from '@nestjs/common';
import { SaveAppLog } from '../utils/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RoleEntity } from '../database/entities/role.entity';
import { ICurrentUser } from '../current-user/current-user.decorator';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdatePermissionDto } from './dto/updatePermission.dto';
import { PermissionEntity } from '../database/entities/permission.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { ServiceEntity } from '../database/entities/service.entity';
import { EStatus } from '../enum/common';

@Injectable()
export class RoleService {
  private readonly logger = new SaveAppLog(RoleService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,

    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async updateUserRole(role_uuid: string, users: string[]) {
    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.uuid = :uuid`, { uuid: role_uuid })
        .getOne();

      if (!role) {
        throw new Error(`Role not exist`);
      }
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({
          role_uuid,
        })
        .where(`uuid IN(:...users)`, { users })
        .execute();

      this.logger.log(`update user role completed`, this.updateUserRole.name, {
        users,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.updateUserRole.name);
      throw Error(error);
    }
  }

  async createRole(body: CreateRoleDto, user: ICurrentUser) {
    try {
      await this.roleRepository
        .createQueryBuilder()
        .insert()
        .into(RoleEntity)
        .values([
          {
            name: body.name,
            description: body.description,
            createdBy: user.uuid,
            company_uuid: user.company,
          },
        ])
        .execute();
      this.logger.log(`create role completed`, this.createRole.name, {
        name: body.name,
        company: user.company,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.createRole.name);
      throw Error(error);
    }
  }

  async getSystemRole() {
    try {
      const data = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.company_uuid IS NULL`)
        .select([
          `r.uuid AS uuid`,
          `r.name AS name`,
          `r.description AS description`,
          `r.company_uuid AS company_uuid`,
        ])
        .getRawMany();
      return data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getSystemRole.name);
      throw Error(error);
    }
  }

  async getCompanyRole(page: number, limit: number, company: string) {
    try {
      const query = this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.company_uuid = :company`, { company });
      const [data, count] = await Promise.all([
        query
          .select([
            `r.uuid AS uuid`,
            `r.name AS name`,
            `r.description AS description`,
            `r.company_uuid AS company_uuid`,
          ])
          .useIndex('roles_company_idx')
          .offset((page - 1) * limit)
          .limit(limit)
          .getRawMany(),
        query.getCount(),
      ]);

      return { data, count };
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getCompanyRole.name);
      throw Error(error);
    }
  }

  async updatePermission(
    uuid: string,
    body: UpdatePermissionDto[],
    user: ICurrentUser,
  ) {
    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.uuid = :uuid`, { uuid })
        .andWhere(`r.company_uuid = :company`, { company: user.company })
        .getOne();

      if (!role) {
        throw new Error(`Role not exist.`);
      }

      const updatePromise = body.map((item) =>
        this.permissionRepository
          .createQueryBuilder()
          .update()
          .set({
            permission: item.permission,
            updatedBy: user.uuid,
          })
          .where(`feature_uuid = :feature`, { feature: item.feature_uuid })
          .andWhere(`role_uuid = :role`, { role: uuid })
          .execute(),
      );
      await Promise.all(updatePromise);
      this.logger.log(
        `update permission completed`,
        this.updatePermission.name,
        { uuid },
      );
    } catch (error) {
      this.logger.error(error.message, error.stack, this.updatePermission.name);
      throw Error(error);
    }
  }

  async getPermissionRole(uuid: string, company: string) {
    try {
      const role = await this.roleRepository
        .createQueryBuilder(`r`)
        .where(`r.uuid = :uuid`, { uuid })
        .getOne();

      const query = this.permissionRepository
        .createQueryBuilder(`p`)
        .innerJoin(FeatureEntity, `f`, `f.uuid = p.feature_uuid`)
        .innerJoin(RoleEntity, `r`, `r.uuid = p.role_uuid`)
        .innerJoin(ServiceEntity, `s`, `s.uuid = f.service_uuid`)
        .where(`r.uuid = :uuid`, { uuid })
        .select([
          `s."uuid" AS service_uuid`,
          `s."name" AS service`,
          `f.uuid AS feature_uuid`,
          `f."name" AS feature`,
          `MIN(p."permission" ->> 'view') as "view"`,
          `MIN(p."permission" ->> 'insert') as "insert"`,
          `MIN(p."permission" ->> 'update') as "update"`,
          `MIN(p."permission" ->> 'delete') as "delete"`,
        ]);
      if (role?.company_uuid) {
        query.andWhere(`r.company_uuid = :company`, { company });
      }
      query
        .groupBy(`s.uuid`)
        .addGroupBy(`s.name`)
        .addGroupBy(`f.uuid`)
        .addGroupBy(`f.name`);

      const data = await query.getRawMany();
      if (!data) {
        throw new Error(`Role not found.`);
      }
      return data;
    } catch (error) {
      this.logger.error(
        error.message,
        error.stack,
        this.getPermissionRole.name,
      );

      throw Error(error);
    }
  }

  async getUserRole(uuid: string) {
    try {
      this.logger.log(`get login user role`, this.getUserRole.name, { uuid });
      const roleUser = await this.userRepository
        .createQueryBuilder(`u`)
        .innerJoin(RoleEntity, `r`, `u.role_uuid = r.uuid`)
        .where(`u.uuid = :uuid`, { uuid })
        .select([
          `u.uuid AS user_uuid`,
          `r.name AS name`,
          `u."createdAt" AS "createdAt"`,
          `u."updatedAt" AS "updatedAt"`,
          `r.uuid AS role_uuid`,
          `r.company_uuid AS company_uuid`,
        ])
        .getRawOne();
      const permission = await this.permissionRepository
        .createQueryBuilder(`p`)
        .innerJoin(FeatureEntity, `f`, `f.uuid = p.feature_uuid`)
        .innerJoin(ServiceEntity, `s`, `s.uuid = f.service_uuid`)
        .where(`p.role_uuid = :uuid`, { uuid: roleUser.role_uuid })
        .andWhere(`p.status = :status`, { status: EStatus.ACTIVE })
        .select([
          `p.uuid AS uuid`,
          `s.uuid AS service_uuid`,
          `s.name AS "serviceName"`,
          `f.uuid AS feature_uuid`,
          `f.name AS "featureName"`,
          `p.permission AS permission`,
        ])
        .getRawMany();
      return { roleUser, permission };
    } catch (error) {
      this.logger.error(
        error.message,
        error.stack,
        this.getPermissionRole.name,
      );

      throw Error(error);
    }
  }
}
