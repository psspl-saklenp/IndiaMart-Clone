/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Sequelize-CLI configuration. Used only by the migrate/seed npm scripts;
 * the running app uses NestJS @nestjs/sequelize via DatabaseModule.
 */
require('dotenv').config({ path: '.env' });

const common = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true,
  },
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeData',
};

module.exports = {
  development: {
    ...common,
    database: process.env.DB_NAME_DEVELOPMENT || 'indiamart_clone_dev',
  },
  test: {
    ...common,
    database: process.env.DB_NAME_TEST || 'indiamart_clone_test',
    logging: false,
  },
  production: {
    ...common,
    database: process.env.DB_NAME_PRODUCTION,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
