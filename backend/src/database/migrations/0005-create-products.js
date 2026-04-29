'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Required by the trigram index below; safe no-op if already enabled.
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');

    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      name: { type: Sequelize.STRING(220), allowNull: false },
      slug: { type: Sequelize.STRING(260), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      specifications: { type: Sequelize.JSONB, allowNull: true },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      currency: { type: Sequelize.STRING(8), allowNull: false, defaultValue: 'INR' },
      min_order_qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'piece' },
      stock_status: {
        type: Sequelize.ENUM('in_stock', 'out_of_stock', 'made_to_order'),
        allowNull: false,
        defaultValue: 'in_stock',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      view_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      inquiry_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('products', ['seller_id'], { name: 'products_seller_idx' });
    await queryInterface.addIndex('products', ['category_id'], { name: 'products_category_idx' });
    await queryInterface.addIndex('products', ['is_active'], { name: 'products_active_idx' });
    await queryInterface.addIndex('products', ['price'], { name: 'products_price_idx' });

    // Trigram index on name for fuzzy ILIKE search; pg_trgm is enabled at init.
    await queryInterface.sequelize.query(
      'CREATE INDEX products_name_trgm_idx ON products USING gin (name gin_trgm_ops);',
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_products_stock_status";');
  },
};
