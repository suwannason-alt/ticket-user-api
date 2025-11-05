import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { SaveAppLog } from '../utils/logger';
import { AuthGuard } from '../guard/auth.guard';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import type { Response } from 'express';
import httpStatus from 'http-status';
import { ReadPermissionDto } from './dto/permission.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/permission')
export class PermissionController {
  private readonly logger = new SaveAppLog(PermissionController.name);
  constructor(private readonly permissionService: PermissionService) {}

  @Post('/')
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
}
