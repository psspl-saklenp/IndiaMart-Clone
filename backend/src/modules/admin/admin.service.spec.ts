import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { AdminService } from './admin.service';
import { Category } from '../categories/category.model';
import { Inquiry } from '../inquiries/inquiry.model';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import { User } from '../users/user.model';
import { UserRole } from '../users/enums/user-role.enum';

describe('AdminService', () => {
  let service: AdminService;
  let userModel: { findByPk: jest.Mock };

  beforeEach(async () => {
    userModel = { findByPk: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(SellerProfile), useValue: {} },
        { provide: getModelToken(Product), useValue: {} },
        { provide: getModelToken(Category), useValue: {} },
        { provide: getModelToken(Inquiry), useValue: {} },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('forbids an admin from demoting themselves', async () => {
    userModel.findByPk.mockResolvedValueOnce({
      id: 'admin-1',
      role: UserRole.ADMIN,
      save: jest.fn(),
    });
    await expect(
      service.updateUser('admin-1', 'admin-1', { role: UserRole.BUYER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows an admin to verify another user', async () => {
    const target = {
      id: 'u-1',
      email: 'x@x',
      name: 'X',
      role: UserRole.SELLER,
      isVerified: false,
      phone: null,
      lastLoginAt: null,
      get: () => new Date(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    userModel.findByPk.mockResolvedValueOnce(target);
    const result = await service.updateUser('u-1', 'admin-1', { isVerified: true });
    expect(target.save).toHaveBeenCalled();
    expect(result.isVerified).toBe(true);
  });

  it('forbids an admin from deleting themselves via the admin panel', async () => {
    await expect(service.deleteUser('admin-1', 'admin-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('returns NotFound on update when user does not exist', async () => {
    userModel.findByPk.mockResolvedValueOnce(null);
    await expect(service.updateUser('missing', 'admin-1', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
