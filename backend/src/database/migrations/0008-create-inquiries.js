'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inquiries', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subject: { type: Sequelize.STRING(220), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: true },
      unit: { type: Sequelize.STRING(32), allowNull: true },
      expected_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      status: {
        type: Sequelize.ENUM('new', 'responded', 'closed'),
        allowNull: false,
        defaultValue: 'new',
      },
      buyer_last_read_at: { type: Sequelize.DATE, allowNull: true },
      seller_last_read_at: { type: Sequelize.DATE, allowNull: true },
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

    await queryInterface.addIndex('inquiries', ['buyer_id'], { name: 'inquiries_buyer_idx' });
    await queryInterface.addIndex('inquiries', ['seller_id'], { name: 'inquiries_seller_idx' });
    await queryInterface.addIndex('inquiries', ['product_id'], { name: 'inquiries_product_idx' });
    await queryInterface.addIndex('inquiries', ['status'], { name: 'inquiries_status_idx' });
    await queryInterface.addIndex('inquiries', ['created_at'], { name: 'inquiries_created_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inquiries');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inquiries_status";');
  },
};
