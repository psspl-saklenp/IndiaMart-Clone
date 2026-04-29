'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      name: {
        type: Sequelize.STRING(160),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(180),
        allowNull: false,
        unique: true,
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      icon_url: { type: Sequelize.STRING(500), allowNull: true },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      description: { type: Sequelize.TEXT, allowNull: true },
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

    await queryInterface.addIndex('categories', ['parent_id'], {
      name: 'categories_parent_idx',
    });
    await queryInterface.addIndex('categories', ['position'], {
      name: 'categories_position_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
