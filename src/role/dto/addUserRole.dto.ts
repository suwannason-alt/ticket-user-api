import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class AddUserRoleDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  users: string[];
}
