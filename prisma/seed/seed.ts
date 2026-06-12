import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MemberRole,
  OfficeStatus,
  PrismaClient,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const adminSeedPath = join(__dirname, 'admin.seed.local.json');

interface AdminSeedConfig {
  email: string;
  password: string;
  fullName: string;
  officeName: string;
  officeSlug: string;
}

async function main() {
  const adminSeed = readAdminSeedConfig();
  const passwordHash = await bcrypt.hash(adminSeed.password, 10);

  await prisma.$transaction(async (tx) => {
    const office = await tx.office.upsert({
      where: { slug: adminSeed.officeSlug },
      update: {
        name: adminSeed.officeName,
        email: adminSeed.email,
        status: OfficeStatus.ACTIVE,
      },
      create: {
        name: adminSeed.officeName,
        slug: adminSeed.officeSlug,
        email: adminSeed.email,
        status: OfficeStatus.ACTIVE,
      },
      select: { id: true },
    });

    const user = await tx.user.upsert({
      where: { email: adminSeed.email },
      update: {
        fullName: adminSeed.fullName,
        passwordHash,
        status: UserStatus.ACTIVE,
        isPlatformAdmin: true,
      },
      create: {
        email: adminSeed.email,
        fullName: adminSeed.fullName,
        passwordHash,
        status: UserStatus.ACTIVE,
        isPlatformAdmin: true,
      },
      select: { id: true, email: true },
    });

    await tx.officeMember.upsert({
      where: {
        officeId_userId: {
          officeId: office.id,
          userId: user.id,
        },
      },
      update: {
        role: MemberRole.OWNER,
        isActive: true,
      },
      create: {
        officeId: office.id,
        userId: user.id,
        role: MemberRole.OWNER,
        isActive: true,
      },
      select: { id: true },
    });

    process.stdout.write(`Seeded platform admin: ${user.email}\n`);
  });
}

function readAdminSeedConfig(): AdminSeedConfig {
  if (!existsSync(adminSeedPath)) {
    throw new Error(
      `Missing admin seed config at ${adminSeedPath}. ` +
        'Copy prisma/seed/admin.seed.example.json to ' +
        'prisma/seed/admin.seed.local.json and fill in the private values.',
    );
  }

  const parsedConfig: unknown = JSON.parse(readFileSync(adminSeedPath, 'utf8'));

  if (!isRecord(parsedConfig)) {
    throw new Error('Admin seed config must be a JSON object.');
  }

  const email = readRequiredString(parsedConfig, 'email').toLowerCase();
  const password = readRequiredString(parsedConfig, 'password');

  if (password.length < 12) {
    throw new Error('Admin seed password must be at least 12 characters.');
  }

  if (password === 'change-this-password') {
    throw new Error(
      'Replace the example admin seed password before running the seed.',
    );
  }

  return {
    email,
    password,
    fullName: readOptionalString(parsedConfig, 'fullName') ?? 'Platform Admin',
    officeName:
      readOptionalString(parsedConfig, 'officeName') ??
      'Aqarati Platform Admin',
    officeSlug:
      readOptionalString(parsedConfig, 'officeSlug') ??
      'aqarati-platform-admin',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readRequiredString(
  config: Record<string, unknown>,
  key: string,
): string {
  const value = readOptionalString(config, key);

  if (!value) {
    throw new Error(`Admin seed config is missing "${key}".`);
  }

  return value;
}

function readOptionalString(
  config: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = config[key];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

main()
  .catch((e) => {
    process.stderr.write(`${formatError(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
