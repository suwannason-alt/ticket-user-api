import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { CategoryService } from './category.service';
import type { Response } from 'express';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import httpStatus from 'http-status';
import { PaginationQueryDto } from '../common/pagination.dto';
import { RolesGuard } from '../guard/role.guard';
import { Permission } from '../permission/permission. decorator';
import {
  EAction,
  EAdminFeature,
} from '../permission/interface/permission.interface';

@ApiTags('Category')
@Controller('/category')
@UseGuards(AuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  @Permission({
    feature: EAdminFeature.CATEGORY,
    action: EAction.view,
  })
  async getCategory(
    @CurrentUser() user: ICurrentUser,
    @Query() query: PaginationQueryDto,
    @Res() res: Response,
  ) {
    try {
      const { page, limit } = query;
      const { data, count } = await this.categoryService.getCategory(
        user.company,
        page,
        limit,
      );
      res.status(httpStatus.OK);
      res.json({
        success: true,
        data: {
          rowCount: count,
          data,
        },
      });
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({ success: false, message: error.message });
    }
  }
}
