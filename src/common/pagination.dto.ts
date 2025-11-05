import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  limit: number;
}
