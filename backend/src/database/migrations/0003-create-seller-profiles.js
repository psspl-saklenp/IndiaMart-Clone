'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seller_profiles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      company_name: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(200),
        allowNull: true,
        unique: true,
      },
      gst_number: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      established_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      business_type: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      banner_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      is_verified_supplier: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rating_avg: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0,
      },
      rating_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('seller_profiles', ['is_verified_supplier'], {
      name: 'seller_profiles_verified_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('seller_profiles');
  },
};
