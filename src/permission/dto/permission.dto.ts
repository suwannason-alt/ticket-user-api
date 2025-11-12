import { ApiProperty } from '@nestjs/swagger';
import { EAllFeature } from '../interface/permission.interface';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReadPermissionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  service_uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EAllFeature)
  feature: EAllFeature;
}
export class PermissionDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  insert: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  update: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  delete: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  view: boolean;
}

export class CreatePermissionDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  feature_uuid: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  role_uuid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: () => PermissionDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  permissions: PermissionDto[];
}
