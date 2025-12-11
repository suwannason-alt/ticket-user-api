import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../permission/permission. decorator';
import { ConfigService } from '@nestjs/config';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private reflector: Reflector,

    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { feature, action } = this.reflector.get(
      Permission,
      context.getHandler(),
    );
    const service = this.configService.get<string>('ADMIN_SERVICE_UUID') || '';
    const request = context.switchToHttp().getRequest();
    const company = request.user.company;
    const user = request.user.uuid;

    const data = await this.permissionService.readPermission(
      user,
      company,
      service,
      feature,
    );
    const allow = data.permission;
    if (allow[action]) {
      return true;
    }

    throw new ForbiddenException(`Not have permission to access.`);
  }
}
