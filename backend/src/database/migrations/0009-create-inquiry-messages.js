'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inquiry_messages', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      inquiry_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'inquiries', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      attachments: { type: Sequelize.JSONB, allowNull: true },
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

    await queryInterface.addIndex('inquiry_messages', ['inquiry_id'], {
      name: 'inquiry_messages_inquiry_idx',
    });
    await queryInterface.addIndex('inquiry_messages', ['sender_user_id'], {
      name: 'inquiry_messages_sender_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inquiry_messages');
  },
};
