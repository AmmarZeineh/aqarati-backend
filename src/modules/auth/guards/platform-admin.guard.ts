import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: Pick<AuthenticatedUser, 'isPlatformAdmin'>;
    }>();

    if (request.user?.isPlatformAdmin) {
      return true;
    }

    throw new ForbiddenException('Platform admin access required');
  }
}
