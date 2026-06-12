import { ApiProperty } from '@nestjs/swagger';

export class OfficeSubscriptionEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  officeId: string;

  @ApiProperty()
  codeId: string;

  @ApiProperty({ type: Date })
  startsAt: Date;

  @ApiProperty({ type: Date })
  expiresAt: Date;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
