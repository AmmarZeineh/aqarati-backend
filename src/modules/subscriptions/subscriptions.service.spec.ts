import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  MemberRole,
  OfficeStatus,
  SubscriptionCodeStatus,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subscriptionsRepository: jest.Mocked<SubscriptionsRepository>;
  let createCodeMock: jest.MockedFunction<
    SubscriptionsRepository['createCode']
  >;
  let redeemCodeMock: jest.MockedFunction<
    SubscriptionsRepository['redeemCode']
  >;
  let findCurrentByOfficeMock: jest.MockedFunction<
    SubscriptionsRepository['findCurrentByOffice']
  >;

  beforeEach(() => {
    createCodeMock = jest.fn();
    redeemCodeMock = jest.fn();
    findCurrentByOfficeMock = jest.fn();
    subscriptionsRepository = {
      createCode: createCodeMock,
      redeemCode: redeemCodeMock,
      findCurrentByOffice: findCurrentByOfficeMock,
    };
    service = new SubscriptionsService(subscriptionsRepository);
  });

  it('creates a subscription code with a normalized hash', async () => {
    const createdAt = new Date('2026-06-12T00:00:00.000Z');
    createCodeMock.mockResolvedValue({
      id: 'code-id',
      code: 'AQ-1234-ABCD',
      codePreview: 'ABCD',
      durationDays: 30,
      status: SubscriptionCodeStatus.ACTIVE,
      expiresAt: null,
      redeemedAt: null,
      redeemedOfficeId: null,
      createdAt,
    });

    await expect(
      service.createCode(
        {
          code: ' aq 1234-abcd ',
          durationDays: 30,
        },
        createUser({ isPlatformAdmin: true }),
      ),
    ).resolves.toEqual({
      id: 'code-id',
      code: 'AQ-1234-ABCD',
      codePreview: 'ABCD',
      durationDays: 30,
      status: SubscriptionCodeStatus.ACTIVE,
      expiresAt: null,
      redeemedAt: null,
      redeemedOfficeId: null,
      createdAt,
    });
    expect(createCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AQ-1234-ABCD',
        codeHash: hashCode('AQ1234ABCD'),
        codePreview: 'ABCD',
        durationDays: 30,
        expiresAt: null,
        createdById: 'user-id',
      }),
    );
  });

  it('rejects code creation when the code expiry is in the past', async () => {
    await expect(
      service.createCode(
        {
          durationDays: 30,
          expiresAt: '2020-01-01T00:00:00.000Z',
        },
        createUser({ isPlatformAdmin: true }),
      ),
    ).rejects.toThrow(BadRequestException);
    expect(createCodeMock).not.toHaveBeenCalled();
  });

  it('redeems a code for the authenticated user office', async () => {
    const subscription = {
      id: 'subscription-id',
      officeId: 'office-id',
      codeId: 'code-id',
      startsAt: new Date('2026-06-12T00:00:00.000Z'),
      expiresAt: new Date('2026-07-12T00:00:00.000Z'),
      createdAt: new Date('2026-06-12T00:00:00.000Z'),
    };
    redeemCodeMock.mockResolvedValue({
      subscription,
      officeStatus: OfficeStatus.ACTIVE,
    });

    await expect(
      service.redeemCode({ code: 'aq 1234-abcd' }, createUser()),
    ).resolves.toEqual({
      subscription,
      officeStatus: OfficeStatus.ACTIVE,
    });
    expect(redeemCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        codeHash: hashCode('AQ1234ABCD'),
        officeId: 'office-id',
        userId: 'user-id',
        redeemedAt: expect.any(Date) as Date,
      }),
    );
  });
});

function createUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    id: 'user-id',
    email: 'owner@example.com',
    fullName: 'Office Owner',
    membershipId: 'membership-id',
    officeId: 'office-id',
    role: MemberRole.OWNER,
    ...overrides,
  };
}

function hashCode(normalizedCode: string): string {
  return createHash('sha256').update(normalizedCode).digest('hex');
}
