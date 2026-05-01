import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { Category } from '../categories/category.model';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import type { JwtRefreshPayload } from './types/jwt-payload.interface';

const stubJwtConfig = {
  secret: 'test-access-secret-1234567890',
  expiration: '15m',
  refreshSecret: 'test-refresh-secret-1234567890',
  refreshExpiration: '7d',
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let sellerProfileModel: { count: jest.Mock; create: jest.Mock };
  let categoryModel: { findOne: jest.Mock; create: jest.Mock };
  let productModel: { count: jest.Mock; create: jest.Mock };
  let sequelizeConnection: { transaction: jest.Mock };

  const buildUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-uuid-1',
    email: 'buyer@example.com',
    name: 'Test Buyer',
    role: UserRole.BUYER,
    phone: null,
    isVerified: false,
    lastLoginAt: null,
    passwordHash: '',
    ...overrides,
  });

  beforeEach(async () => {
    sellerProfileModel = { count: jest.fn(), create: jest.fn() };
    categoryModel = { findOne: jest.fn(), create: jest.fn() };
    productModel = { count: jest.fn(), create: jest.fn() };
    // Default stub: run the callback with a fake transaction object so the
    // service's transactional code path is exercised end-to-end.
    sequelizeConnection = {
      transaction: jest.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({ id: 'tx' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            emailExists: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByIdOrFail: jest.fn(),
            createWithProfile: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((path: string) => {
              if (path === 'jwt') return stubJwtConfig;
              if (path === 'nodeEnv') return 'test';
              return undefined;
            }),
          },
        },
        {
          // The seller signup paths inject the Sequelize connection to wrap
          // user/profile/product creation in a transaction. The default stub
          // immediately invokes the callback so the transactional logic is
          // exercised; individual tests can override the spy as needed.
          provide: getConnectionToken(),
          useValue: sequelizeConnection,
        },
        { provide: getModelToken(Category), useValue: categoryModel },
        { provide: getModelToken(Product), useValue: productModel },
        { provide: getModelToken(SellerProfile), useValue: sellerProfileModel },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jwtService.signAsync.mockImplementation(async (payload: object, opts?: JwtSignOptions) => {
      const isRefresh = opts?.secret === stubJwtConfig.refreshSecret;
      return `${isRefresh ? 'refresh' : 'access'}.${(payload as { sub: string }).sub}`;
    });
  });

  describe('register', () => {
    it('hashes the password, creates the user, and issues a token pair', async () => {
      usersService.emailExists.mockResolvedValue(false);
      const created = buildUser({ passwordHash: 'will-be-set' });
      usersService.createWithProfile.mockImplementation(async (input) => {
        // bcrypt hash should be a 60-char string starting with $2
        expect(input.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
        // verify the hash actually corresponds to the provided password
        await expect(bcrypt.compare('GoodPass123', input.passwordHash)).resolves.toBe(true);
        return { ...created, passwordHash: input.passwordHash } as never;
      });
      usersService.updateLastLogin.mockResolvedValue(undefined);

      const result = await authService.register({
        email: 'buyer@example.com',
        password: 'GoodPass123',
        name: 'Test Buyer',
        role: UserRole.BUYER,
      } as never);

      expect(result.user).toMatchObject({
        id: 'user-uuid-1',
        email: 'buyer@example.com',
        role: UserRole.BUYER,
      });
      expect(result.accessToken).toBe('access.user-uuid-1');
      expect(result.refreshToken).toBe('refresh.user-uuid-1');
      expect(result.expiresIn).toBe(15 * 60);
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-uuid-1');
    });

    it('rejects when the email already exists', async () => {
      usersService.emailExists.mockResolvedValue(true);

      await expect(
        authService.register({
          email: 'taken@example.com',
          password: 'GoodPass123',
          name: 'Anyone',
          role: UserRole.BUYER,
        } as never),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(usersService.createWithProfile).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens when password matches', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass1', 10);
      usersService.findByEmail.mockResolvedValue(buildUser({ passwordHash }) as never);

      const result = await authService.login({
        email: 'buyer@example.com',
        password: 'CorrectPass1',
      });

      expect(result.user.email).toBe('buyer@example.com');
      expect(result.accessToken).toBe('access.user-uuid-1');
      expect(result.refreshToken).toBe('refresh.user-uuid-1');
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-uuid-1');
    });

    it('throws Unauthorized when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nope@example.com', password: 'whatever1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws Unauthorized when password mismatches', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass1', 10);
      usersService.findByEmail.mockResolvedValue(buildUser({ passwordHash }) as never);

      await expect(
        authService.login({ email: 'buyer@example.com', password: 'WrongPass1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('issues a fresh pair when the user still exists', async () => {
      usersService.findById.mockResolvedValue(buildUser() as never);

      const tokens = await authService.refresh({
        sub: 'user-uuid-1',
        email: 'buyer@example.com',
        role: UserRole.BUYER,
        tokenId: 'whatever',
      } as JwtRefreshPayload);

      expect(tokens.accessToken).toBe('access.user-uuid-1');
      expect(tokens.refreshToken).toBe('refresh.user-uuid-1');
    });

    it('rejects when the user is gone', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        authService.refresh({
          sub: 'gone',
          email: 'gone@example.com',
          role: UserRole.BUYER,
          tokenId: 'x',
        } as JwtRefreshPayload),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('upgradeToSeller', () => {
    const dto = {
      city: 'Mumbai',
      pincode: '400001',
      panNumber: 'ABCDE1234F',
      gstNumber: '27ABCDE1234F1Z5',
      products: [
        { name: 'Industrial Bearing 6203' },
        { name: 'Coupling Sleeve 22mm' },
        { name: 'Rotary Encoder Module' },
      ],
    };

    it('flips the role, creates a seller profile, seeds products, and reissues tokens', async () => {
      const save = jest.fn();
      const buyer = buildUser({
        save,
        buyerProfile: { companyName: 'Acme Co' },
      });
      usersService.findById.mockResolvedValue(buyer as never);
      usersService.findByIdOrFail.mockResolvedValue({
        ...buyer,
        role: UserRole.SELLER,
      } as never);

      sellerProfileModel.count.mockResolvedValue(0);
      sellerProfileModel.create.mockResolvedValue({});
      categoryModel.findOne.mockResolvedValue({ id: 'cat-1' });
      productModel.count.mockResolvedValue(0);
      productModel.create.mockResolvedValue({});

      const result = await authService.upgradeToSeller('user-uuid-1', dto);

      // Role is flipped before the save inside the transaction.
      expect(buyer.role).toBe(UserRole.SELLER);
      expect(save).toHaveBeenCalledTimes(1);

      // Seller profile is created with the buyer's existing company name.
      expect(sellerProfileModel.create).toHaveBeenCalledTimes(1);
      const profileArgs = sellerProfileModel.create.mock.calls[0]?.[0];
      expect(profileArgs).toMatchObject({
        userId: 'user-uuid-1',
        companyName: 'Acme Co',
        gstNumber: '27ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        city: 'Mumbai',
        pincode: '400001',
      });

      // All three seed products are created.
      expect(productModel.create).toHaveBeenCalledTimes(3);

      // Tokens reissued and last-login bumped.
      expect(usersService.updateLastLogin).toHaveBeenCalledWith('user-uuid-1');
      expect(result.user.role).toBe(UserRole.SELLER);
      expect(result.accessToken).toBe('access.user-uuid-1');
      expect(result.refreshToken).toBe('refresh.user-uuid-1');
    });

    it('rejects with NotFoundException when the user no longer exists', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(authService.upgradeToSeller('missing', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(sellerProfileModel.create).not.toHaveBeenCalled();
    });

    it('rejects with ConflictException when the user is already a seller', async () => {
      const save = jest.fn();
      const existingSeller = buildUser({ role: UserRole.SELLER, save });
      usersService.findById.mockResolvedValue(existingSeller as never);

      await expect(
        authService.upgradeToSeller('user-uuid-1', dto),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(save).not.toHaveBeenCalled();
      expect(sellerProfileModel.create).not.toHaveBeenCalled();
    });
  });

  describe('toSeconds', () => {
    it.each<[string | number, number]>([
      ['15m', 900],
      ['1h', 3600],
      ['7d', 604_800],
      ['30s', 30],
      [42, 42],
      ['bogus', 0],
    ])('parses %p -> %p', (input, expected) => {
      expect(authService.toSeconds(input)).toBe(expected);
    });
  });
});
