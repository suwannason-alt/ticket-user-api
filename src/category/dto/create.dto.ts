import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false })
  @IsArray()
  parent: string[];

  @ApiProperty({ required: false })
  @IsArray()
  assignTo: string[];
}
