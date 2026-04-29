'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_products', {
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
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
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
    });

    await queryInterface.addIndex('saved_products', ['buyer_id', 'product_id'], {
      name: 'saved_products_buyer_product_uq',
      unique: true,
    });
    await queryInterface.addIndex('saved_products', ['buyer_id'], {
      name: 'saved_products_buyer_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_products');
  },
};
