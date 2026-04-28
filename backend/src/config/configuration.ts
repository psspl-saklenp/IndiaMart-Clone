/**
 * Centralised configuration loader.
 * All env-var access happens here so the rest of the app reads typed config values
 * via `ConfigService.get('path.to.value')`.
 */

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  clientUrl: string;
  apiPrefix: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  aws: AwsConfig;
  throttle: ThrottleConfig;
  swagger: SwaggerConfig;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  nameDevelopment: string;
  nameTest: string;
  nameProduction: string;
  dialect: 'postgres';
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  logging: boolean;
}

export interface JwtConfig {
  secret: string;
  expiration: string;
  refreshSecret: string;
  refreshExpiration: string;
}

export interface AwsConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  s3Bucket?: string;
  s3PublicUrl?: string;
}

export interface ThrottleConfig {
  ttl: number;
  limit: number;
}

export interface SwaggerConfig {
  enabled: boolean;
  path: string;
}

const toBool = (v: string | undefined, fallback = false): boolean => {
  if (v === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

const toInt = (v: string | undefined, fallback: number): number => {
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

export default (): AppConfig => ({
  port: toInt(process.env.PORT, 3001),
  nodeEnv: (process.env.NODE_ENV ?? 'development') as AppConfig['nodeEnv'],
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    nameDevelopment: process.env.DB_NAME_DEVELOPMENT ?? 'indiamart_clone_dev',
    nameTest: process.env.DB_NAME_TEST ?? 'indiamart_clone_test',
    nameProduction: process.env.DB_NAME_PRODUCTION ?? '',
    dialect: 'postgres',
    pool: {
      max: toInt(process.env.DB_POOL_MAX, 5),
      min: toInt(process.env.DB_POOL_MIN, 0),
      acquire: toInt(process.env.DB_POOL_ACQUIRE, 30000),
      idle: toInt(process.env.DB_POOL_IDLE, 10000),
    },
    logging: toBool(process.env.DB_LOGGING, false),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiration: process.env.JWT_EXPIRATION ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    s3PublicUrl: process.env.AWS_S3_BUCKET_PUBLIC_URL,
  },
  throttle: {
    ttl: toInt(process.env.THROTTLE_TTL, 60000),
    limit: toInt(process.env.THROTTLE_LIMIT, 100),
  },
  swagger: {
    enabled: toBool(process.env.SWAGGER_ENABLED, true),
    path: process.env.SWAGGER_PATH ?? 'api/docs',
  },
});
