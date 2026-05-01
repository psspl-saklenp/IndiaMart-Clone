import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';

import { InquiriesService } from './inquiries.service';
import { Inquiry } from './inquiry.model';
import { InquiryMessage } from './inquiry-message.model';
import { InquiryStatus } from './enums/inquiry-status.enum';
import { Product } from '../products/product.model';
import { User } from '../users/user.model';
import { UserRole } from '../users/enums/user-role.enum';

describe('InquiriesService', () => {
  let service: InquiriesService;
  let inquiryModel: {
    create: jest.Mock;
    findByPk: jest.Mock;
    update: jest.Mock;
    findAll: jest.Mock;
    findAndCountAll: jest.Mock;
  };
  let messageModel: { create: jest.Mock };
  let productModel: { findByPk: jest.Mock; increment: jest.Mock };
  let userModel: { findByPk: jest.Mock };

  beforeEach(async () => {
    inquiryModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
    };
    messageModel = { create: jest.fn() };
    productModel = { findByPk: jest.fn(), increment: jest.fn().mockResolvedValue(undefined) };
    userModel = { findByPk: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: getModelToken(Inquiry), useValue: inquiryModel },
        { provide: getModelToken(InquiryMessage), useValue: messageModel },
        { provide: getModelToken(Product), useValue: productModel },
        { provide: getModelToken(User), useValue: userModel },
      ],
    }).compile();

    service = module.get(InquiriesService);
  });

  const buyer = { id: 'buyer-1', email: 'b@x', role: UserRole.BUYER };
  const seller = { id: 'seller-1', email: 's@x', role: UserRole.SELLER };
  const otherUser = { id: 'random-1', email: 'r@x', role: UserRole.BUYER };

  describe('create', () => {
    it('rejects sending to yourself', async () => {
      await expect(
        service.create(buyer, {
          sellerId: buyer.id,
          subject: 'hi',
          message: 'msg',
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when seller does not exist', async () => {
      userModel.findByPk.mockResolvedValueOnce(null);
      await expect(
        service.create(buyer, {
          sellerId: 'missing',
          subject: 'hi',
          message: 'msg',
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when target user is not actually a seller', async () => {
      userModel.findByPk.mockResolvedValueOnce({ id: 'x', role: UserRole.BUYER });
      await expect(
        service.create(buyer, {
          sellerId: 'x',
          subject: 'hi',
          message: 'msg',
        } as never),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when productId belongs to a different seller', async () => {
      userModel.findByPk.mockResolvedValueOnce({ id: seller.id, role: UserRole.SELLER });
      productModel.findByPk.mockResolvedValueOnce({ id: 'p1', sellerId: 'someone-else' });
      await expect(
        service.create(buyer, {
          sellerId: seller.id,
          productId: 'p1',
          subject: 'hi',
          message: 'msg',
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('addMessage', () => {
    it('forbids users who are not buyer/seller/admin', async () => {
      inquiryModel.findByPk.mockResolvedValueOnce({
        id: 'i1',
        buyerId: buyer.id,
        sellerId: seller.id,
        status: InquiryStatus.NEW,
        messages: [],
        get: () => new Date(),
      });
      await expect(service.addMessage('i1', otherUser, { message: 'hi' })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('rejects messages on a closed inquiry', async () => {
      inquiryModel.findByPk.mockResolvedValueOnce({
        id: 'i1',
        buyerId: buyer.id,
        sellerId: seller.id,
        status: InquiryStatus.CLOSED,
        messages: [],
        get: () => new Date(),
      });
      await expect(service.addMessage('i1', buyer, { message: 'hi' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    it('forbids buyers from changing status', async () => {
      inquiryModel.findByPk.mockResolvedValueOnce({
        id: 'i1',
        buyerId: buyer.id,
        sellerId: seller.id,
        status: InquiryStatus.NEW,
        messages: [],
        get: () => new Date(),
        save: jest.fn(),
      });
      await expect(service.updateStatus('i1', buyer, InquiryStatus.CLOSED)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
