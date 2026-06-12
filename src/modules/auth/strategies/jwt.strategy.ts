import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { MemberRole, UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/services/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  officeId: string;
  membershipId: string;
  role: MemberRole;
  isPlatformAdmin?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'fallback_secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        status: UserStatus.ACTIVE,
        memberships: {
          some: {
            id: payload.membershipId,
            officeId: payload.officeId,
            role: payload.role,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isPlatformAdmin: true,
        memberships: {
          where: {
            id: payload.membershipId,
            officeId: payload.officeId,
            isActive: true,
          },
          take: 1,
          select: {
            id: true,
            officeId: true,
            role: true,
          },
        },
      },
    });

    const membership = user?.memberships[0];

    if (!user || !membership) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isPlatformAdmin: user.isPlatformAdmin,
      membershipId: membership.id,
      officeId: membership.officeId,
      role: membership.role,
    };
  }
}
