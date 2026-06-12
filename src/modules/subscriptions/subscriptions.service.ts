import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateSubscriptionCodeDto } from './dto/create-subscription-code.dto';
import { RedeemSubscriptionCodeDto } from './dto/redeem-subscription-code.dto';
import { OfficeSubscriptionEntity } from './entities/office-subscription.entity';
import { RedeemSubscriptionCodeResultEntity } from './entities/redeem-subscription-code-result.entity';
import { SubscriptionCodeEntity } from './entities/subscription-code.entity';
import { SUBSCRIPTIONS_REPOSITORY } from './repositories/subscriptions.repository';
import type { SubscriptionsRepository } from './repositories/subscriptions.repository';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(SUBSCRIPTIONS_REPOSITORY)
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {}

  async createCode(
    dto: CreateSubscriptionCodeDto,
    user: AuthenticatedUser,
  ): Promise<SubscriptionCodeEntity> {
    const code = dto.code
      ? this.formatCustomCode(dto.code)
      : this.generateCode();
    const normalizedCode = this.normalizeCode(code);
    const expiresAt = this.parseCodeExpiry(dto.expiresAt);

    return this.subscriptionsRepository.createCode({
      code,
      codeHash: this.hashCode(normalizedCode),
      codePreview: normalizedCode.slice(-4),
      durationDays: dto.durationDays,
      expiresAt,
      notes: dto.notes,
      createdById: user.id,
    });
  }

  async redeemCode(
    dto: RedeemSubscriptionCodeDto,
    user: AuthenticatedUser,
  ): Promise<RedeemSubscriptionCodeResultEntity> {
    const normalizedCode = this.normalizeCode(dto.code);

    return this.subscriptionsRepository.redeemCode({
      codeHash: this.hashCode(normalizedCode),
      officeId: user.officeId,
      userId: user.id,
      redeemedAt: new Date(),
    });
  }

  async getCurrentSubscription(
    user: AuthenticatedUser,
  ): Promise<OfficeSubscriptionEntity | null> {
    return this.subscriptionsRepository.findCurrentByOffice(
      user.officeId,
      new Date(),
    );
  }

  private generateCode(): string {
    const rawCode = randomBytes(8).toString('hex').toUpperCase();
    const groups = rawCode.match(/.{1,4}/g) ?? [rawCode];

    return `AQ-${groups.join('-')}`;
  }

  private formatCustomCode(code: string): string {
    return code
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase().replace(/[\s-]/g, '');

    if (!normalizedCode || !/^[A-Z0-9]+$/.test(normalizedCode)) {
      throw new BadRequestException('Subscription code format is invalid');
    }

    return normalizedCode;
  }

  private hashCode(normalizedCode: string): string {
    return createHash('sha256').update(normalizedCode).digest('hex');
  }

  private parseCodeExpiry(expiresAt?: string): Date | null {
    if (!expiresAt) {
      return null;
    }

    const expiry = new Date(expiresAt);

    if (expiry <= new Date()) {
      throw new BadRequestException('Subscription code expiry must be future');
    }

    return expiry;
  }
}
