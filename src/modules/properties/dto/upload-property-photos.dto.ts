import { ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoVisibility } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UploadPropertyPhotosDto {
  @ApiPropertyOptional({
    enum: PhotoVisibility,
    default: PhotoVisibility.PUBLIC,
    example: PhotoVisibility.PUBLIC,
  })
  @IsEnum(PhotoVisibility)
  @IsOptional()
  visibility?: PhotoVisibility;

  @ApiPropertyOptional({ example: 'Living room' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional({ example: 'living_room' })
  @Transform(trimString)
  @IsString()
  @IsOptional()
  @MaxLength(80)
  roomType?: string;

  @ApiPropertyOptional({ default: 0, example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrderStart?: number;
}
