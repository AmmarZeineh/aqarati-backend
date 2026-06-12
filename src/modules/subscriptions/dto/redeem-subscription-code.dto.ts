import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RedeemSubscriptionCodeDto {
  @ApiProperty({ example: 'AQ-9F3K-2M8P-Q7ZD' })
  @IsString()
  @MinLength(6)
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9\-\s]+$/)
  code: string;
}
