'use strict';

/**
 * Populates seller_profiles.slug for rows created before the field was set
 * during registration (Phase 4). Uses a slugify-style transformation in SQL:
 * lower(company_name), replace non-alphanum with '-', collapse '--', strip
 * leading/trailing dashes. Suffixes the row's truncated UUID to guarantee
 * uniqueness without doing a row-by-row collision check.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE seller_profiles
      SET slug = COALESCE(
        regexp_replace(
          regexp_replace(
            lower(coalesce(company_name, 'supplier')),
            '[^a-z0-9]+', '-', 'g'
          ),
          '(^-+|-+$)', '', 'g'
        ),
        'supplier'
      ) || '-' || substr(replace(id::text, '-', ''), 1, 6)
      WHERE slug IS NULL OR slug = '';
    `);
  },

  async down(queryInterface) {
    // No-op: clearing slugs would break /sellers/:slug for any signed-up sellers.
    await queryInterface.sequelize.query('SELECT 1;');
  },
};
