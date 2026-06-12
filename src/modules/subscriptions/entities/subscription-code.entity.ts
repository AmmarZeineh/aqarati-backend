import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionCodeStatus } from '@prisma/client';

export class SubscriptionCodeEntity {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({
    description: 'Plain code is returned only immediately after creation.',
  })
  code?: string;

  @ApiProperty({ example: 'Q7ZD' })
  codePreview: string;

  @ApiProperty({ example: 30 })
  durationDays: number;

  @ApiProperty({ enum: SubscriptionCodeStatus })
  status: SubscriptionCodeStatus;

  @ApiPropertyOptional({ type: Date, nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional({ type: Date, nullable: true })
  redeemedAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  redeemedOfficeId: string | null;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
