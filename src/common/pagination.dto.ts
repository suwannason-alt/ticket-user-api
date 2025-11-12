import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty()
  page: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty()
  @Min(1)
  @Max(30)
  limit: number;
}
