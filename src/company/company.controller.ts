import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import httpStatus from 'http-status';
import type { Response } from 'express';
import { SaveAppLog } from '../utils/logger';
import { AuthGuard } from '../guard/auth.guard';
import { CreateCompanyDto } from './dto/createCompany.dto';
import { CompanyService } from './company.service';
import { CurrentUser } from '../current-user/current-user.decorator';
import type { ICurrentUser } from '../current-user/current-user.decorator';
import { RolesGuard } from '../guard/role.guard';
import { Permission } from '../permission/permission. decorator';
import {
  EAction,
  EAdminFeature,
} from '../permission/interface/permission.interface';

@ApiTags('Company')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/company')
export class CompanyController {
  private readonly logger = new SaveAppLog(CompanyController.name);
  constructor(private readonly companyService: CompanyService) {}
  @Post('/')
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreateCompanyDto,
    @Res() res: Response,
  ) {
    try {
      this.logger.debug({ user });
      await this.companyService.create(body, user.uuid);
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Create company completed.` });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Put('/:id')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.COMPANY,
    action: EAction.update,
  })
  async update(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Body() body: CreateCompanyDto,
    @Res() res: Response,
  ) {
    try {
      await this.companyService.update(body, id, user.uuid);
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Update company completed.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.update.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/:id')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.COMPANY,
    action: EAction.delete,
  })
  async delete(
    @CurrentUser() user: ICurrentUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const company_uuid = await this.companyService.delete(id, user.uuid);

      if (!company_uuid) {
        res.json({
          success: false,
          message: `Company not allow this user delete`,
        });
        return;
      }
      res.status(httpStatus.OK);
      res.json({ success: true });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.delete.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('/switch-company/:company')
  async userSwitchCompany(
    @Headers('Authorization') authorization: string,
    @CurrentUser() user: ICurrentUser,
    @Param('company') company: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.companyService.switchCompany(
        authorization,
        company,
        user,
      );
      res.json({
        success: true,
        message: `Switch company completed`,
        data: data.token,
      });
    } catch (error) {
      res.status(httpStatus.UNAUTHORIZED);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/is-active')
  async companyIsActive(
    @CurrentUser() user: ICurrentUser,
    @Res() res: Response,
  ) {
    try {
      const isActive = await this.companyService.isActive(user.company);
      if (isActive) {
        res.status(httpStatus.OK);
        res.json({ success: true, message: `Verify company completed.` });
        return;
      }
      res.status(httpStatus.GONE);
      res.json({ success: false, message: `Company is not active.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.companyIsActive.name);
      res.status(httpStatus.FORBIDDEN);
    }
  }

  @Get('/service')
  async getCompanyService(
    @CurrentUser() user: ICurrentUser,
    @Res() res: Response,
  ) {
    try {
      const services = await this.companyService.companyService(user.company);
      res.json({ success: true, message: `Service company.`, data: services });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/feature/:service')
  async getCompanyFeature(
    @CurrentUser() user: ICurrentUser,
    @Param('service') service_uuid: string,
    @Res() res: Response,
  ) {
    try {
      const features = await this.companyService.companyFeature(
        service_uuid,
        user.company,
      );
      res.json({
        success: true,
        message: 'Features service completed',
        data: features,
      });
    } catch (error) {
      let status;
      if (error.message.includes(`can't delete user`)) {
        status = httpStatus.FORBIDDEN;
      } else {
        status = httpStatus.INTERNAL_SERVER_ERROR;
      }
      res.status(status);
      res.json({ success: false, message: error.message });
    }
  }
}
