import {
  Injectable,
  CanActivate,
  ExecutionContext,
  GoneException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { SaveAppLog } from '../utils/logger';
import { CompanyService } from '../company/company.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  private readonly logger = new SaveAppLog(CompanyGuard.name);

  constructor(private readonly companyService: CompanyService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const profile = request.user;
    this.logger.debug({ profile });
    if(!profile.company)
    {
      throw new NotAcceptableException(`No company selected. Please select a company to proceed.`); 
    }
    const canAccess = await this.companyService.isActive(
      profile.company,
      profile.uuid,
    );
    if (canAccess === true) {
      return true;
    }
    this.logger.error(
      `fail to access company`,
      'throw GoneException',
      this.canActivate.name,
      {
        company: profile.company,
        user: profile.uuid,
      },
    );

    throw new ConflictException(`Your company is not active. Please contact administrator.`);
  }
}
