import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyPurpose, PropertyStatus, PropertyType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ListPropertiesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  @IsOptional()
  type?: PropertyType;

  @ApiPropertyOptional({ enum: PropertyPurpose, example: PropertyPurpose.SALE })
  @IsEnum(PropertyPurpose)
  @IsOptional()
  purpose?: PropertyPurpose;

  @ApiPropertyOptional({ example: 'Damascus' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'Mezzeh' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  area?: string;

  @ApiPropertyOptional({ example: 'furnished apartment' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(160)
  search?: string;
}
