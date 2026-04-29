import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route handler (or controller) as public so the global JwtAuthGuard
 * skips authentication for it.
 *
 * @example
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
