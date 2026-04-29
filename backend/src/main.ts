import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);

  const port = config.get<number>('port', 3001);
  const nodeEnv = config.get<string>('nodeEnv', 'development');
  const clientUrl = config.get<string>('clientUrl', 'http://localhost:3000');
  const apiPrefix = config.get<string>('apiPrefix', 'api/v1');
  const swaggerEnabled = config.get<boolean>('swagger.enabled', true);
  const swaggerPath = config.get<string>('swagger.path', 'api/docs');

  // ----- Security & performance middleware -----
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
      // Allow other origins (the Next.js dev server, future Vercel deploy) to
      // embed assets served by /uploads/* via plain <img>.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // ----- CORS -----
  app.enableCors({
    origin: clientUrl.split(',').map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ----- Global API prefix & validation -----
  // Health endpoints live under the prefix (e.g. /api/v1/health) for consistency.
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ----- Swagger / OpenAPI -----
  if (swaggerEnabled && nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('indiamart-clone API')
      .setDescription('REST API for the indiamart-clone B2B marketplace')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger docs available at /${swaggerPath}`);
  }

  // ----- Graceful shutdown -----
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`Server running at http://localhost:${port} (${nodeEnv})`);
  logger.log(`API base: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health:   http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', error);
  process.exit(1);
});
