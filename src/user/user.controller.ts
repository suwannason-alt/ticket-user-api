import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SaveAppLog } from '../utils/logger';
import httpStatus from 'http-status';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CredentialService } from '../credential/credential.service';
import { AuthGuard } from '../guard/auth.guard';
import { InviteDto } from './dto/invite.dto';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import { PaginationQueryDto } from '../common/pagination.dto';
import { RolesGuard } from '../guard/role.guard';
import { Permission } from '../permission/permission. decorator';
import {
  EAction,
  EAdminFeature,
} from '../permission/interface/permission.interface';
import { SearchUserDto } from './dto/searchUser.dto';

@Controller('/users')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  private readonly logger = new SaveAppLog(UserController.name);
  constructor(
    private readonly userService: UserService,
    private readonly credentialService: CredentialService,
  ) {}

  @Post('/register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    try {
      const results = await this.userService.register(body);

      if (results === null) {
        this.logger.log(`user already exist`, this.register.name, {
          email: body.email,
        });
        res.status(httpStatus.BAD_REQUEST);
        res.json({ success: false, message: `User already exist.` });
        return;
      }
      res.json({ success: true, message: `Register completed.` });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Post('/login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    try {
      const user = await this.userService.login(body);
      if (!user) {
        this.logger.log(`login fail`, this.login.name, {
          username: body.email,
        });
        res.status(httpStatus.BAD_REQUEST);
        res.json({
          success: false,
          message: `Username or password incorrect.`,
        });
        return;
      }
      const jwt = await this.credentialService.signJwt({
        uuid: user.uuid,
        company: user.company,
      });
      this.logger.log(`login completed`, this.login.name, {
        username: body.email,
        company: user.company,
      });
      res.status(httpStatus.OK);
      res.json({
        success: true,
        data: jwt.data.token,
        profile: user,
      });
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Permission({
    feature: EAdminFeature.USER,
    action: EAction.insert,
  })
  @Post('/invite')
  async inviteUser(
    @CurrentUser() user: ICurrentUser,
    @Body() body: InviteDto,
    @Res() res: Response,
  ) {
    try {
      await this.userService.inviteUser(body, user);
      res.status(httpStatus.OK);
      res.json({ success: true, message: `Invite user completed.` });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.inviteUser.name, body);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Permission({
    feature: EAdminFeature.USER,
    action: EAction.view,
  })
  @Get('/invite')
  async getInvite(
    @CurrentUser() user: ICurrentUser,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const { page, limit } = query;
      const result = await this.userService.listInvite(page, limit, user);
      res.status(httpStatus.OK);
      res.json({
        success: true,
        message: `Invite user in company`,
        data: { rowCount: result.count, data: result.data },
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getInvite.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Permission({
    feature: EAdminFeature.USER,
    action: EAction.view,
  })
  @Patch('/')
  async getUserCompany(
    @CurrentUser() user: ICurrentUser,
    @Query() query: PaginationQueryDto,
    @Body() body: SearchUserDto,
    @Res() res: Response,
  ) {
    try {
      const results = await this.userService.listUser(
        query.page,
        query.limit,
        user.company,
      );
      res.json({
        success: true,
        message: `List user in company`,
        rowCount: results.count,
        data: results.data,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getUserCompany.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(@CurrentUser() user: ICurrentUser, @Res() res: Response) {
    try {
      const profile = await this.userService.getProfile(user.uuid);
      Object.assign(profile, { company: user.company });
      res.status(httpStatus.OK);
      res.json({ success: true, data: profile });
    } catch (error) {
      this.logger.error(error.message, error.stack, this.getProfile.name);
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }

  @Delete('/:uuid')
  @UseGuards(AuthGuard, RolesGuard)
  @Permission({
    feature: EAdminFeature.USER,
    action: EAction.delete,
  })
  async deleteUser(
    @CurrentUser() user: ICurrentUser,
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      await this.userService.deleteUser(uuid, user);
      res.json({ success: true });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
