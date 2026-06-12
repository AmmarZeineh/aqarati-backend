import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionCodeDto {
  @ApiPropertyOptional({
    example: 'AQARATI-2026-30D',
    description:
      'Optional custom code. If omitted, a secure code is generated.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9\-\s]+$/)
  code?: string;

  @ApiProperty({
    example: 30,
    minimum: 1,
    maximum: 3650,
    description: 'Subscription duration granted by this code, in days.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  durationDays: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description:
      'Optional date after which the unused code cannot be redeemed.',
  })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiPropertyOptional({
    example: 'June campaign for new offices.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
