'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_reviews', {
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
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      title: { type: Sequelize.STRING(120), allowNull: true },
      body: { type: Sequelize.TEXT, allowNull: true },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // Rating must be 1–5
    await queryInterface.sequelize.query(
      `ALTER TABLE product_reviews ADD CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5);`,
    );

    // One review per reviewer per product
    await queryInterface.addIndex('product_reviews', ['product_id', 'reviewer_id'], {
      unique: true,
      name: 'product_reviews_product_reviewer_uidx',
      where: { deleted_at: null },
    });

    await queryInterface.addIndex('product_reviews', ['product_id'], {
      name: 'product_reviews_product_idx',
    });

    await queryInterface.addIndex('product_reviews', ['reviewer_id'], {
      name: 'product_reviews_reviewer_idx',
    });

    await queryInterface.addIndex('product_reviews', ['created_at'], {
      name: 'product_reviews_created_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_reviews');
  },
};
