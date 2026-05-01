'use strict';

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env' });

/**
 * Seeds a top-level `general` category that acts as the fallback bucket for
 * the multi-step seller signup. Sellers provide product names without
 * explicit categories during registration; we still need a non-null
 * `category_id` for those products. Idempotent.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      'SELECT id FROM categories WHERE slug = :slug LIMIT 1',
      {
        replacements: { slug: 'general' },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      },
    );
    if (existing && existing.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[seed] general category already exists, skipping');
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      {
        name: 'General',
        slug: 'general',
        position: 999,
        created_at: now,
        updated_at: now,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log('[seed] general fallback category seeded');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', { slug: 'general' });
  },
};
