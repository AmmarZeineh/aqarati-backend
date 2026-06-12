import { ApiProperty } from '@nestjs/swagger';
import { OfficeStatus } from '@prisma/client';
import { OfficeSubscriptionEntity } from './office-subscription.entity';

export class RedeemSubscriptionCodeResultEntity {
  @ApiProperty({ type: OfficeSubscriptionEntity })
  subscription: OfficeSubscriptionEntity;

  @ApiProperty({ enum: OfficeStatus })
  officeStatus: OfficeStatus;
}
