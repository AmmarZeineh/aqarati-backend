import { Module } from '@nestjs/common';
import {
  AdminSubscriptionCodesController,
  SubscriptionsController,
} from './subscriptions.controller';
import { PrismaSubscriptionsRepository } from './repositories/prisma-subscriptions.repository';
import { SUBSCRIPTIONS_REPOSITORY } from './repositories/subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [AdminSubscriptionCodesController, SubscriptionsController],
  providers: [
    SubscriptionsService,
    {
      provide: SUBSCRIPTIONS_REPOSITORY,
      useClass: PrismaSubscriptionsRepository,
    },
  ],
})
export class SubscriptionsModule {}
