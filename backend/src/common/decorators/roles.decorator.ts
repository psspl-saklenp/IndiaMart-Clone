import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../../modules/users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to specific roles. Used together with `RolesGuard`.
 *
 * @example
 *   @Roles(UserRole.SELLER, UserRole.ADMIN)
 *   @Post('products')
 */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
