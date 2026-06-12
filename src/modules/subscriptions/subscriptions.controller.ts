import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateSubscriptionCodeDto } from './dto/create-subscription-code.dto';
import { RedeemSubscriptionCodeDto } from './dto/redeem-subscription-code.dto';
import { OfficeSubscriptionEntity } from './entities/office-subscription.entity';
import { RedeemSubscriptionCodeResultEntity } from './entities/redeem-subscription-code-result.entity';
import { SubscriptionCodeEntity } from './entities/subscription-code.entity';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Admin Subscription Codes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller('admin/subscription-codes')
export class AdminSubscriptionCodesController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a one-time subscription code' })
  @ApiCreatedResponse({
    description: 'Subscription code created successfully',
    type: SubscriptionCodeEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid code details' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Platform admin access is required' })
  @ApiConflictResponse({ description: 'Subscription code already exists' })
  async create(
    @Body() dto: CreateSubscriptionCodeDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubscriptionCodeEntity> {
    return this.subscriptionsService.createCode(dto, user);
  }
}

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('redeem')
  @Roles(MemberRole.OWNER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Redeem a one-time subscription code' })
  @ApiCreatedResponse({
    description: 'Subscription activated successfully',
    type: RedeemSubscriptionCodeResultEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired code' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiForbiddenResponse({ description: 'Only office owners can redeem codes' })
  @ApiConflictResponse({ description: 'Subscription code is not available' })
  async redeem(
    @Body() dto: RedeemSubscriptionCodeDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RedeemSubscriptionCodeResultEntity> {
    return this.subscriptionsService.redeemCode(dto, user);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current office subscription' })
  @ApiOkResponse({
    description: 'Current active subscription, or null if none exists',
    type: OfficeSubscriptionEntity,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async current(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OfficeSubscriptionEntity | null> {
    return this.subscriptionsService.getCurrentSubscription(user);
  }
}
