import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemberRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/services/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.passwordSaltRounds,
    );

    return this.prisma.$transaction(async (tx) => {
      const office = await tx.office.create({
        data: {
          name: dto.officeName,
          slug: this.createOfficeSlug(dto.officeName),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      });

      const user = await tx.user.create({
        data: {
          fullName: dto.ownerName,
          email: dto.email,
          passwordHash,
          status: UserStatus.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          status: true,
          createdAt: true,
        },
      });

      const membership = await tx.officeMember.create({
        data: {
          officeId: office.id,
          userId: user.id,
          role: MemberRole.OWNER,
        },
        select: {
          id: true,
          officeId: true,
          role: true,
          isActive: true,
        },
      });

      return {
        message: 'Office created successfully',
        office,
        user: {
          ...user,
          membership,
        },
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        status: true,
        isPlatformAdmin: true,
        memberships: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: {
            id: true,
            officeId: true,
            role: true,
            office: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const membership = user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('User has no active office membership');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      officeId: membership.officeId,
      membershipId: membership.id,
      role: membership.role,
      isPlatformAdmin: user.isPlatformAdmin,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: membership.role,
        isPlatformAdmin: user.isPlatformAdmin,
        office: membership.office,
      },
    };
  }

  private createOfficeSlug(name: string): string {
    const normalized = name
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-|-$/g, '');

    return `${normalized || 'office'}-${randomUUID().slice(0, 8)}`;
  }
}
