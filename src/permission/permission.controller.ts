import { Body, Controller, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { SaveAppLog } from '../utils/logger';
import { AuthGuard } from '../guard/auth.guard';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import type { Response } from 'express';
import httpStatus from 'http-status';
import { CreatePermissionDto, ReadPermissionDto } from './dto/permission.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guard/role.guard';
import { Permission } from './permission. decorator';
import { EAction, EAdminFeature } from './interface/permission.interface';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/permissions')
export class PermissionController {
  private readonly logger = new SaveAppLog(PermissionController.name);
  constructor(private readonly permissionService: PermissionService) {}

  @Patch('/')
  async getPermission(
    @CurrentUser() user: ICurrentUser,
    @Body() body: ReadPermissionDto,
    @Res() res: Response,
  ) {
    try {
      const permission = await this.permissionService.readPermission(
        user.uuid,
        user.company,
        body.service_uuid,
        body.feature,
      );
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Permission user`, data: permission });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Post('/')
  @UseGuards(RolesGuard)
  @Permission({
    action: EAction.update,
    feature: EAdminFeature.ROLE,
  })
  async createPermissionRole(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreatePermissionDto,
    @Res() res: Response,
  ) {
    try {
      await this.permissionService.createPermission(body, user);
      res.status(httpStatus.OK);
      res.json({ success: true });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
