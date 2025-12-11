import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/role.guard';
import { RoleService } from './role.service';
import { type Response } from 'express';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import httpStatus from 'http-status';
import { AddUserRoleDto } from './dto/addUserRole.dto';
import { Permission } from '../permission/permission. decorator';
import {
  EAction,
  EAdminFeature,
} from '../permission/interface/permission.interface';
import { CreateRoleDto } from './dto/createRole.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { UpdatePermissionDto } from './dto/updatePermission.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('/:uuid/add-user-role')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.USER,
    action: EAction.update,
  })
  async addUserRole(
    @Param('uuid') role: string,
    @Body() body: AddUserRoleDto,
    @Res() res: Response,
  ) {
    try {
      await this.roleService.updateUserRole(role, body.users);
      res.json({ success: true, message: `Update user role completed.` });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Post('/')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.ROLE,
    action: EAction.insert,
  })
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreateRoleDto,
    @Res() res: Response,
  ) {
    try {
      await this.roleService.createRole(body, user);
      res.status(httpStatus.CREATED);
      res.json({ success: true, message: `Create role completed.` });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Put('/:uuid/permission')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.ROLE,
    action: EAction.update,
  })
  async updatePermissiom(
    @CurrentUser() user: ICurrentUser,
    @Param('uuid') uuid: string,
    @Body() body: UpdatePermissionDto[],
    @Res() res: Response,
  ) {
    try {
      await this.roleService.updatePermission(uuid, body, user);
      res.json({ success: true, message: `Update permission completed.` });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/:uuid/permission')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.ROLE,
    action: EAction.view,
  })
  async getPermissionRole(
    @CurrentUser() user: ICurrentUser,
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.roleService.getPermissionRole(uuid, user.company);
      res.json({ success: true, message: `Permission in role`, data });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/system')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.ROLE,
    action: EAction.view,
  })
  async getSystemRole(@Res() res: Response) {
    try {
      const data = await this.roleService.getSystemRole();
      res.json({ success: true, message: `System role.`, data });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/custom')
  @UseGuards(RolesGuard)
  @Permission({
    feature: EAdminFeature.ROLE,
    action: EAction.view,
  })
  async getCustomRole(
    @CurrentUser() user: ICurrentUser,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const { page, limit } = query;
      const { data, count } = await this.roleService.getCompanyRole(
        page,
        limit,
        user.company,
      );
      res.json({
        success: true,
        message: `Company role.`,
        data: { rowCount: count, data },
      });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Get('/user')
  async getUserRole(@CurrentUser() user: ICurrentUser, @Res() res: Response) {
    try {
      const data = await this.roleService.getUserRole(user.uuid);
      res.json({
        success: true,
        message: `User's role.`,
        data: {
          role: data.roleUser,
          permission: data.permission,
        },
      });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
