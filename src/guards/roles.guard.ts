import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  matchRoles(roles: string[], userRole: Role[]) {
    return roles.some((role) => userRole.some(({ name }) => name === role));
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return this.matchRoles(roles, user.roles);
  }
}
