import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfficeStatus, Prisma, SubscriptionCodeStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prisma.service';
import { OfficeSubscriptionEntity } from '../entities/office-subscription.entity';
import { SubscriptionCodeEntity } from '../entities/subscription-code.entity';
import {
  CreateSubscriptionCodeRepositoryInput,
  RedeemSubscriptionCodeRepositoryInput,
  RedeemSubscriptionCodeRepositoryResult,
  SubscriptionsRepository,
} from './subscriptions.repository';

const subscriptionCodeSelect = {
  id: true,
  codePreview: true,
  durationDays: true,
  status: true,
  expiresAt: true,
  redeemedAt: true,
  redeemedOfficeId: true,
  createdAt: true,
} satisfies Prisma.SubscriptionCodeSelect;

type SelectedSubscriptionCode = Prisma.SubscriptionCodeGetPayload<{
  select: typeof subscriptionCodeSelect;
}>;

const officeSubscriptionSelect = {
  id: true,
  officeId: true,
  codeId: true,
  startsAt: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.OfficeSubscriptionSelect;

type SelectedOfficeSubscription = Prisma.OfficeSubscriptionGetPayload<{
  select: typeof officeSubscriptionSelect;
}>;

@Injectable()
export class PrismaSubscriptionsRepository implements SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCode(
    input: CreateSubscriptionCodeRepositoryInput,
  ): Promise<SubscriptionCodeEntity> {
    try {
      const code = await this.prisma.subscriptionCode.create({
        data: {
          codeHash: input.codeHash,
          codePreview: input.codePreview,
          durationDays: input.durationDays,
          expiresAt: input.expiresAt,
          notes: input.notes,
          createdById: input.createdById,
        },
        select: subscriptionCodeSelect,
      });

      return {
        ...this.toSubscriptionCodeEntity(code),
        code: input.code,
      };
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async redeemCode(
    input: RedeemSubscriptionCodeRepositoryInput,
  ): Promise<RedeemSubscriptionCodeRepositoryResult> {
    try {
      const subscription = await this.prisma.$transaction(async (tx) => {
        const code = await tx.subscriptionCode.findUnique({
          where: { codeHash: input.codeHash },
          select: {
            id: true,
            durationDays: true,
            status: true,
            expiresAt: true,
            redeemedAt: true,
          },
        });

        if (!code) {
          throw new BadRequestException('Subscription code is invalid');
        }

        if (code.status !== SubscriptionCodeStatus.ACTIVE) {
          throw new ConflictException('Subscription code is not available');
        }

        if (code.redeemedAt) {
          throw new ConflictException('Subscription code was already used');
        }

        if (code.expiresAt && code.expiresAt <= input.redeemedAt) {
          throw new BadRequestException('Subscription code has expired');
        }

        const claim = await tx.subscriptionCode.updateMany({
          where: {
            id: code.id,
            status: SubscriptionCodeStatus.ACTIVE,
            redeemedAt: null,
          },
          data: {
            status: SubscriptionCodeStatus.REDEEMED,
            redeemedAt: input.redeemedAt,
            redeemedById: input.userId,
            redeemedOfficeId: input.officeId,
          },
        });

        if (claim.count !== 1) {
          throw new ConflictException('Subscription code was already used');
        }

        const latestSubscription = await tx.officeSubscription.findFirst({
          where: { officeId: input.officeId },
          orderBy: { expiresAt: 'desc' },
          select: { expiresAt: true },
        });

        const startsAt =
          latestSubscription && latestSubscription.expiresAt > input.redeemedAt
            ? latestSubscription.expiresAt
            : input.redeemedAt;
        const expiresAt = this.addDays(startsAt, code.durationDays);

        const createdSubscription = await tx.officeSubscription.create({
          data: {
            officeId: input.officeId,
            codeId: code.id,
            redeemedById: input.userId,
            startsAt,
            expiresAt,
          },
          select: officeSubscriptionSelect,
        });

        await tx.office.update({
          where: { id: input.officeId },
          data: { status: OfficeStatus.ACTIVE },
          select: { id: true },
        });

        return createdSubscription;
      });

      return {
        subscription: this.toOfficeSubscriptionEntity(subscription),
        officeStatus: OfficeStatus.ACTIVE,
      };
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async findCurrentByOffice(
    officeId: string,
    now: Date,
  ): Promise<OfficeSubscriptionEntity | null> {
    const subscription = await this.prisma.officeSubscription.findFirst({
      where: {
        officeId,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'desc' },
      select: officeSubscriptionSelect,
    });

    return subscription ? this.toOfficeSubscriptionEntity(subscription) : null;
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private handlePrismaError(error: unknown): void {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return;
    }

    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Subscription code already exists');
      case 'P2003':
        throw new BadRequestException('Invalid subscription relation');
      case 'P2025':
        throw new NotFoundException('Subscription record not found');
    }
  }

  private toSubscriptionCodeEntity(
    code: SelectedSubscriptionCode,
  ): SubscriptionCodeEntity {
    return { ...code };
  }

  private toOfficeSubscriptionEntity(
    subscription: SelectedOfficeSubscription,
  ): OfficeSubscriptionEntity {
    return { ...subscription };
  }
}
