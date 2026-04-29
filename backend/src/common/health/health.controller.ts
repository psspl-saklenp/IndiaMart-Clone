import { Controller, Get, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Sequelize } from 'sequelize-typescript';

import { Public } from '../decorators/public.decorator';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
}

interface DbHealthResponse extends HealthResponse {
  database: {
    connected: boolean;
    dialect?: string;
    error?: string;
  };
}

const SERVICE_NAME = 'indiamart-clone-backend';
const SERVICE_VERSION = '0.1.0';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  liveness(): HealthResponse {
    return this.baseHealth('ok');
  }

  @Get('db')
  @ApiOperation({ summary: 'Database readiness probe' })
  async dbHealth(): Promise<DbHealthResponse> {
    try {
      await this.sequelize.authenticate();
      return {
        ...this.baseHealth('ok'),
        database: {
          connected: true,
          dialect: this.sequelize.getDialect(),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      this.logger.warn(`Database health check failed: ${message}`);
      // Return 200 with a degraded payload so orchestrators can decide whether to mark unhealthy.
      // Liveness (above) stays a separate signal at /health.
      return {
        ...this.baseHealth('degraded'),
        database: {
          connected: false,
          error: message,
        },
      };
    }
  }

  private baseHealth(status: HealthResponse['status']): HealthResponse {
    return {
      status,
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
