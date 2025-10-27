import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { SaveAppLog } from '../utils/logger';
import httpStatus from 'http-status';
import type { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('/user')
@ApiTags('user')
export class UserController {
  private readonly logger = new SaveAppLog(UserController.name);
  constructor(private readonly userService: UserService) {}

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
}
