import { OfficeStatus } from '@prisma/client';
import { OfficeSubscriptionEntity } from '../entities/office-subscription.entity';
import { SubscriptionCodeEntity } from '../entities/subscription-code.entity';

export const SUBSCRIPTIONS_REPOSITORY = Symbol('SUBSCRIPTIONS_REPOSITORY');

export interface CreateSubscriptionCodeRepositoryInput {
  code: string;
  codeHash: string;
  codePreview: string;
  durationDays: number;
  expiresAt: Date | null;
  notes?: string;
  createdById: string;
}

export interface RedeemSubscriptionCodeRepositoryInput {
  codeHash: string;
  officeId: string;
  userId: string;
  redeemedAt: Date;
}

export interface RedeemSubscriptionCodeRepositoryResult {
  subscription: OfficeSubscriptionEntity;
  officeStatus: OfficeStatus;
}

export interface SubscriptionsRepository {
  createCode(
    input: CreateSubscriptionCodeRepositoryInput,
  ): Promise<SubscriptionCodeEntity>;

  redeemCode(
    input: RedeemSubscriptionCodeRepositoryInput,
  ): Promise<RedeemSubscriptionCodeRepositoryResult>;

  findCurrentByOffice(
    officeId: string,
    now: Date,
  ): Promise<OfficeSubscriptionEntity | null>;
}
