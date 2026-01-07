import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import type { Response } from 'express';
import { SaveAppLog } from '../utils/logger';
import { CreateGroupDto } from './dto/createGroup.dto';
import { GroupService } from './group.service';
import httpStatus from 'http-status';
import { AddUserGroupDto } from './dto/addUserGroup.dto';
import { PaginationQueryDto } from '../common/pagination.dto';
import { RolesGuard } from '../guard/role.guard';
import { Permission } from '../permission/permission. decorator';
import {
  EAction,
  EAdminFeature,
} from '../permission/interface/permission.interface';
import { SearchUserDto } from '../user/dto/searchUser.dto';
import { CompanyGuard } from '../guard/company.guard';

@ApiTags('Group')
@ApiBearerAuth()
@UseGuards(AuthGuard, CompanyGuard, RolesGuard)
@Controller('/groups')
export class GroupController {
  private readonly logger = new SaveAppLog(GroupController.name);

  constructor(private readonly groupService: GroupService) {}

  @Post('/')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.insert,
  })
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() body: CreateGroupDto,
    @Res() res: Response,
  ) {
    try {
      const results = await this.groupService.createGroup(
        body,
        user.company,
        user.uuid,
      );

      if (!results) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR);
        res.json({ success: false, message: `Cant't create group` });
        return;
      }
      res.status(httpStatus.CREATED);
      res.json({
        success: true,
        message: `Create group completed.`,
        data: results,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.create.name);
      res.json({ success: false });
    }
  }

  @Get('/')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.view,
  })
  async listGroup(
    @CurrentUser() user: ICurrentUser,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const { page, limit } = query;
      const result = await this.groupService.listGroup(
        user.company,
        page,
        limit,
      );
      res.json({
        success: true,
        message: `List group completed.`,
        data: {
          rowCount: result.count,
          data: result.data,
        },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.listGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to fetch group.` });
    }
  }

  @Get('/member/:uuid')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.view,
  })
  async getGroupMember(
    @Param('uuid') uuid: string,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const results = await this.groupService.listMember(
        uuid,
        query.page,
        query.limit,
      );
      res.json({
        success: true,
        message: `List member in group`,
        data: {
          rowCount: results.count,
          data: results.data,
        },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getGroupMember.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to fetch user in group.` });
    }
  }

  @Patch('/not-member/:uuid')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.view,
  })
  async getNotGroupMember(
    @CurrentUser() user: ICurrentUser,
    @Param('uuid') uuid: string,
    @Body() body: SearchUserDto,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const results = await this.groupService.listNotMember(
        { uuid: uuid, company: user.company },
        body?.text,
        query.page,
        query.limit,
      );
      res.json({
        success: true,
        message: `List user not in group`,
        data: {
          rowCount: results.count,
          data: results.data,
        },
      });
    } catch (error) {
      this.logger.error(
        error.message,
        error.stack,
        this.getNotGroupMember.name,
      );
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to fetch user not in group.` });
    }
  }

  @Put('/:id')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.update,
  })
  async updateGroup(
    @CurrentUser() user: ICurrentUser,
    @Param('id') uuid: string,
    @Body() body: CreateGroupDto,
    @Res() res: Response,
  ) {
    try {
      await this.groupService.updateGroup(body, uuid, user);
      res.json({ success: true, message: `Update group success.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.updateGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to update group.` });
    }
  }

  @Delete('/:id')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.delete,
  })
  async deleteGroup(
    @CurrentUser() user: ICurrentUser,
    @Param('id') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.groupService.deleteGroup(uuid, user);
      res.json({ success: true, message: `Delete group completed` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.deleteGroup.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: `Fail to delete group` });
    }
  }

  @Post('/:id/add-user')
  @Permission({
    feature: EAdminFeature.GROUP,
    action: EAction.view,
  })
  async addUser(
    @CurrentUser() user: ICurrentUser,
    @Param('id') uuid: string,
    @Body() body: AddUserGroupDto,
    @Res() res: Response,
  ) {
    try {
      await this.groupService.addUser(uuid, body.users, user);
      res.json({ success: true, message: `Add user to group completed` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.addUser.name);
      res.status(httpStatus.BAD_REQUEST);
      res.json({ success: false, message: error.message });
    }
  }
}
