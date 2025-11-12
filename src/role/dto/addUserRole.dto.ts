import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AddUserRoleDto {
  @ApiProperty({
    type: [String],
    description: 'An array of user UUIDs to assign the role to.',
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('all', {
    each: true,
    message: 'Each user ID in the array must be a valid UUID.',
  })
  users: string[];
}
