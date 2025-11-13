import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyEntity } from '../database/entities/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { SaveAppLog } from '../utils/logger';
import { CompanyUserEntity } from '../database/entities/company-user.entity';
import { EStatus } from '../enum/common';
import { ServiceEntity } from '../database/entities/service.entity';
import { FeatureEntity } from '../database/entities/feature.entity';
import { ICurrentUser } from '../current-user/current-user.decorator';
import { CredentialService } from '../credential/credential.service';

@Injectable()
export class CompanyService {
  private readonly logger = new SaveAppLog(CompanyService.name);
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepoSitory: Repository<CompanyEntity>,

    @InjectRepository(CompanyUserEntity)
    private readonly companyUserRepository: Repository<CompanyUserEntity>,

    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,

    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,

    private readonly credentialService: CredentialService,
  ) {}

  async create(body: CreateCompanyDto, userId: string) {
    try {
      const company = await this.companyRepoSitory
        .createQueryBuilder()
        .insert()
        .into(CompanyEntity)
        .values([
          {
            name: body.name,
            address: body.address,
            telephone: body.telephone,
            email: body.email,
            city: body.city,
            state: body.state,
            country: body.country,
            postalCode: body.postalCode,
            description: body.description,
            createdBy: userId,
          },
        ])
        .execute();

      this.logger.debug(company.raw);
      await this.companyUserRepository
        .createQueryBuilder()
        .insert()
        .into(CompanyUserEntity)
        .values([
          {
            company_uuid: company.raw[0].uuid,
            user_uuid: userId,
          },
        ])
        .execute();

      this.logger.log(`create company completed`, this.create.name, {
        name: body.name,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
      throw new Error(error);
    }
  }

  async update(body: CreateCompanyDto, uuid: string, userId: string) {
    try {
      await this.companyRepoSitory
        .createQueryBuilder()
        .update()
        .set({
          name: body.name,
          address: body.address,
          telephone: body.telephone,
          email: body.email,
          city: body.city,
          state: body.state,
          country: body.country,
          postalCode: body.postalCode,
          description: body.description,
          updatedBy: userId,
        })
        .where(`uuid = :uuid`, { uuid })
        .execute();
      this.logger.log(`update company completed`, this.create.name, {
        name: body.name,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
    }
  }

  async delete(uuid: string, userId: string) {
    try {
      const company = await this.companyRepoSitory
        .createQueryBuilder(`c`)
        .innerJoin(CompanyUserEntity, `cu`, `c.uuid = cu.company_uuid`)
        .where(`c.uuid = :uuid`, { uuid })
        .andWhere(`cu.user_uuid = :user`, { user: userId })
        .select([`c.uuid AS uuid`])
        .getRawOne();

      if (!company) {
        return null;
      }

      await this.companyRepoSitory
        .createQueryBuilder()
        .update()
        .where(`uuid = :uuid`, { uuid })
        .set({ status: EStatus.ARCHIVED, archivedAt: new Date() })
        .execute();

      this.logger.log(`delete company completed`, this.delete.name, {
        user: userId,
      });
      return company.uuid;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.delete.name);
    }
  }

  async isActive(uuid: string) {
    try {
      const company = await this.companyRepoSitory
        .createQueryBuilder(`c`)
        .where(`c.uuid = :uuid`, { uuid })
        .andWhere(`c.status = :status`, { status: EStatus.ACTIVE })
        .getOne();

      return company ? true : false;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.isActive.name);
      throw new Error(error);
    }
  }

  async companyService(company: string) {
    try {
      this.logger.log(`company ${company} read service`);
      const data = await this.serviceRepository
        .createQueryBuilder(`s`)
        .select([
          `s.uuid AS uuid`,
          `s.name AS name`,
          `s.description AS description`,
        ])
        .getRawMany();

      return data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.companyService.name);
      throw new Error(error);
    }
  }

  async companyFeature(service: string, company: string) {
    try {
      this.logger.log(`company ${company} read feature ${service}`);
      const data = await this.featureRepository
        .createQueryBuilder(`f`)
        .innerJoin(ServiceEntity, `s`, `f.service_uuid = s.uuid`)
        .where(`s.uuid = :service`, { service })
        .andWhere(`f.status = :status`, { status: EStatus.ACTIVE })
        .select([`f.uuid AS uuid`, `f.name AS feature`])
        .getRawMany();

      this.logger.log(`company ${company} read feature`);

      return data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.companyFeature.name);
      throw new Error(error);
    }
  }

  async switchCompany(bearer: string, company: string, user: ICurrentUser) {
    try {
      const check = await this.companyUserRepository
        .createQueryBuilder(`cu`)
        .where(`cu.company_uuid = :new`, { new: company })
        .andWhere(`cu.status = :status`, { status: EStatus.ACTIVE })
        .getOne();

      if (!check) {
        throw new Error(`No permission in company`);
      }
      const payload = {
        uuid: user.uuid,
        company,
      };
      const newAuthen = await this.credentialService.changeToken(
        bearer,
        payload,
      );
      this.logger.log(
        `user switch company from ${user.company} to ${company}`,
        this.switchCompany.name,
      );
      return newAuthen.data;
    } catch (error) {
      this.logger.error(error.message, error.stack, this.switchCompany.name);
      throw Error(error);
    }
  }
}
