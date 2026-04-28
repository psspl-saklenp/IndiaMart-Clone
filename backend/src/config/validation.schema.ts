import * as Joi from 'joi';

/**
 * Joi schema validating env vars on application boot.
 * Required vars cause the app to fail-fast (preventing silent misconfig).
 *
 * Phase-1 required: NODE_ENV, PORT, DB_*, JWT_SECRET (used in Phase 2 but pinned now to surface secret-management mistakes early).
 */
export const validationSchema = Joi.object({
  // ---- Application ----
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  CLIENT_URL: Joi.string().uri({ scheme: ['http', 'https'] }).default('http://localhost:3000'),
  API_PREFIX: Joi.string().default('api/v1'),

  // ---- Database (PostgreSQL) ----
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().allow('').required(),
  DB_NAME_DEVELOPMENT: Joi.string().required(),
  DB_NAME_TEST: Joi.string().default('indiamart_clone_test'),
  DB_NAME_PRODUCTION: Joi.string().allow(''),
  DB_DIALECT: Joi.string().valid('postgres').default('postgres'),
  DB_POOL_MAX: Joi.number().integer().min(1).default(5),
  DB_POOL_MIN: Joi.number().integer().min(0).default(0),
  DB_POOL_ACQUIRE: Joi.number().integer().min(1000).default(30000),
  DB_POOL_IDLE: Joi.number().integer().min(0).default(10000),
  DB_LOGGING: Joi.string().valid('true', 'false', '1', '0', 'yes', 'no').default('false'),

  // ---- JWT (placeholders allowed in Phase 1; real secrets enforced before Phase 2 ships) ----
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // ---- AWS (optional in Phase 1; required when bucket is set) ----
  AWS_REGION: Joi.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: Joi.string().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow(''),
  AWS_S3_BUCKET: Joi.string().allow(''),
  AWS_S3_BUCKET_PUBLIC_URL: Joi.string().allow(''),

  // ---- Throttling ----
  THROTTLE_TTL: Joi.number().integer().min(1000).default(60000),
  THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),

  // ---- Swagger ----
  SWAGGER_ENABLED: Joi.string().valid('true', 'false', '1', '0', 'yes', 'no').default('true'),
  SWAGGER_PATH: Joi.string().default('api/docs'),
});
