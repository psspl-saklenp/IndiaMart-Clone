'use strict';

/**
 * Adds the location + verification columns captured during the new
 * 3-step seller registration modal: city, pincode, pan_number.
 * All nullable so existing seller rows remain valid.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('seller_profiles', 'city', {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn('seller_profiles', 'pincode', {
      type: Sequelize.STRING(12),
      allowNull: true,
    });
    await queryInterface.addColumn('seller_profiles', 'pan_number', {
      type: Sequelize.STRING(16),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('seller_profiles', 'pan_number');
    await queryInterface.removeColumn('seller_profiles', 'pincode');
    await queryInterface.removeColumn('seller_profiles', 'city');
  },
};
