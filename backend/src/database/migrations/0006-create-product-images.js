'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      s3_key: { type: Sequelize.STRING(512), allowNull: true },
      url: { type: Sequelize.STRING(1024), allowNull: false },
      is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      alt_text: { type: Sequelize.STRING(220), allowNull: true },
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

    await queryInterface.addIndex('product_images', ['product_id'], {
      name: 'product_images_product_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_images');
  },
};
