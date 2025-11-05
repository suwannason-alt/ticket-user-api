import { ApiProperty } from '@nestjs/swagger';
import { ETicketFeature } from '../interface/permission.interface';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class ReadPermissionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  service_uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ETicketFeature)
  feature: ETicketFeature;
}
