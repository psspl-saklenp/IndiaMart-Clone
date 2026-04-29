'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requirements', {
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
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      title: { type: Sequelize.STRING(220), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: true },
      unit: { type: Sequelize.STRING(32), allowNull: true },
      expected_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      location_city: { type: Sequelize.STRING(120), allowNull: true },
      status: {
        type: Sequelize.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      response_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
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

    await queryInterface.addIndex('requirements', ['buyer_id'], {
      name: 'requirements_buyer_idx',
    });
    await queryInterface.addIndex('requirements', ['category_id'], {
      name: 'requirements_category_idx',
    });
    await queryInterface.addIndex('requirements', ['status'], {
      name: 'requirements_status_idx',
    });
    await queryInterface.addIndex('requirements', ['created_at'], {
      name: 'requirements_created_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('requirements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_requirements_status";');
  },
};
