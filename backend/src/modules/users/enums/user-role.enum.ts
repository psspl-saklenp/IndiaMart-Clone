export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export const USER_ROLES: readonly UserRole[] = [
  UserRole.BUYER,
  UserRole.SELLER,
  UserRole.ADMIN,
] as const;
