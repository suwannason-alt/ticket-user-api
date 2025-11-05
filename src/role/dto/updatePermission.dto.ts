import { ApiProperty } from '@nestjs/swagger';
import { type IAccess } from '../../permission/interface/permission.interface';
import {
  IsNotEmpty,
  IsUUID,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class AccessValidation implements IAccess {
  @ApiProperty()
  @IsBoolean()
  view: boolean;

  @ApiProperty()
  @IsBoolean()
  insert: boolean;

  @ApiProperty()
  @IsBoolean()
  update: boolean;

  @ApiProperty()
  @IsBoolean()
  delete: boolean;
}

export class UpdatePermissionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  feature_uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AccessValidation)
  permission: IAccess;
}
