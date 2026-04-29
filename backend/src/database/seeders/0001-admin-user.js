'use strict';

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env' });
const bcrypt = require('bcrypt');

/**
 * Seeds a single admin user. Idempotent: skips if the email already exists.
 *
 * Override default admin credentials via env vars:
 *   ADMIN_EMAIL       (default: admin@indiamart.local)
 *   ADMIN_PASSWORD    (default: ChangeMe@123 - REPLACE BEFORE DEPLOYING)
 *   ADMIN_NAME        (default: System Admin)
 */

const DEFAULT_EMAIL = process.env.ADMIN_EMAIL || 'admin@indiamart.local';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
const DEFAULT_NAME = process.env.ADMIN_NAME || 'System Admin';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      {
        replacements: { email: DEFAULT_EMAIL.toLowerCase() },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );

    if (existing && existing.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`[seed] admin user already exists (${DEFAULT_EMAIL}); skipping`);
      return;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        email: DEFAULT_EMAIL.toLowerCase(),
        password_hash: passwordHash,
        role: 'admin',
        name: DEFAULT_NAME,
        is_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log(
      `[seed] admin created: ${DEFAULT_EMAIL} / ${DEFAULT_PASSWORD} — ROTATE IN PRODUCTION`,
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: DEFAULT_EMAIL.toLowerCase() });
  },
};
