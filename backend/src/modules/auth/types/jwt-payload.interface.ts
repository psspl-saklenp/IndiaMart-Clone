import type { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  /** Subject - user id */
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload extends JwtPayload {
  /** A short token id used to detect refresh-token reuse later. */
  tokenId: string;
}
