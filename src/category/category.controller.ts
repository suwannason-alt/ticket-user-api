import { Controller, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { CategoryService } from './category.service';
import type { Response } from 'express';
import {
  CurrentUser,
  type ICurrentUser,
} from '../current-user/current-user.decorator';
import httpStatus from 'http-status';

@ApiTags('Category')
@Controller('/category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async getCategory(
    @CurrentUser() user: ICurrentUser,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    try {
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
