import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({ required: false, minimum: 0, default: 0 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  skip: number = 0;

  @ApiProperty({ required: false, minimum: 1, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
