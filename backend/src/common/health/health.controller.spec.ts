import { Test, type TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/sequelize';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockSequelize: { authenticate: jest.Mock; getDialect: jest.Mock };

  beforeEach(async () => {
    mockSequelize = {
      authenticate: jest.fn().mockResolvedValue(undefined),
      getDialect: jest.fn().mockReturnValue('postgres'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: mockSequelize,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('liveness returns ok', () => {
    const res = controller.liveness();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('indiamart-clone-backend');
    expect(res.timestamp).toBeDefined();
  });

  it('db health reports connected on success', async () => {
    const res = await controller.dbHealth();
    expect(res.status).toBe('ok');
    expect(res.database.connected).toBe(true);
    expect(res.database.dialect).toBe('postgres');
    expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
  });

  it('db health reports degraded when authenticate throws', async () => {
    mockSequelize.authenticate.mockRejectedValueOnce(new Error('connection refused'));
    const res = await controller.dbHealth();
    expect(res.status).toBe('degraded');
    expect(res.database.connected).toBe(false);
    expect(res.database.error).toContain('connection refused');
  });
});
