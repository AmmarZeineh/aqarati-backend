import { MemberRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  isPlatformAdmin?: boolean;
  membershipId: string;
  officeId: string;
  role: MemberRole;
}
