import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  text: string;
}
