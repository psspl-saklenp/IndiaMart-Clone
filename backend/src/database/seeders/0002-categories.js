'use strict';

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env' });

/**
 * Seeds a realistic IndiaMART-style category tree.
 * Idempotent: skips top-level cats (and their children) that already exist by slug.
 */

const TREE = [
  {
    name: 'Apparel & Fashion',
    slug: 'apparel-fashion',
    children: [
      { name: 'Mens Clothing', slug: 'mens-clothing' },
      { name: 'Womens Clothing', slug: 'womens-clothing' },
      { name: 'Kids Wear', slug: 'kids-wear' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Fashion Accessories', slug: 'fashion-accessories' },
    ],
  },
  {
    name: 'Electronics & Electrical',
    slug: 'electronics-electrical',
    children: [
      { name: 'Mobile Phones', slug: 'mobile-phones' },
      { name: 'Computers & Laptops', slug: 'computers-laptops' },
      { name: 'Home Appliances', slug: 'home-appliances' },
      { name: 'Cables & Wires', slug: 'cables-wires' },
      { name: 'Solar Products', slug: 'solar-products' },
    ],
  },
  {
    name: 'Industrial Supplies',
    slug: 'industrial-supplies',
    children: [
      { name: 'Hand Tools', slug: 'hand-tools' },
      { name: 'Industrial Machinery', slug: 'industrial-machinery' },
      { name: 'Safety Equipment', slug: 'safety-equipment' },
      { name: 'Pumps & Motors', slug: 'pumps-motors' },
      { name: 'Welding Equipment', slug: 'welding-equipment' },
    ],
  },
  {
    name: 'Building & Construction',
    slug: 'building-construction',
    children: [
      { name: 'Cement & Concrete', slug: 'cement-concrete' },
      { name: 'TMT Bars', slug: 'tmt-bars' },
      { name: 'Tiles & Marble', slug: 'tiles-marble' },
      { name: 'Pipes & Fittings', slug: 'pipes-fittings' },
      { name: 'Doors & Windows', slug: 'doors-windows' },
    ],
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    children: [
      { name: 'Seeds', slug: 'seeds' },
      { name: 'Fertilizers', slug: 'fertilizers' },
      { name: 'Pesticides', slug: 'pesticides' },
      { name: 'Farm Machinery', slug: 'farm-machinery' },
      { name: 'Irrigation Equipment', slug: 'irrigation-equipment' },
    ],
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    children: [
      { name: 'Spices & Masala', slug: 'spices-masala' },
      { name: 'Tea & Coffee', slug: 'tea-coffee' },
      { name: 'Pulses & Grains', slug: 'pulses-grains' },
      { name: 'Edible Oils', slug: 'edible-oils' },
      { name: 'Confectionery', slug: 'confectionery' },
    ],
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    let topPos = 0;

    for (const top of TREE) {
      // skip if already seeded
      const existing = await queryInterface.sequelize.query(
        'SELECT id FROM categories WHERE slug = :slug LIMIT 1',
        {
          replacements: { slug: top.slug },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        },
      );
      if (existing && existing.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`[seed] category exists, skipping: ${top.slug}`);
        topPos += 1;
        continue;
      }

      const [{ id: parentId }] = await queryInterface.sequelize.query(
        `INSERT INTO categories (name, slug, position, created_at, updated_at)
         VALUES (:name, :slug, :position, :now, :now)
         RETURNING id`,
        {
          replacements: { name: top.name, slug: top.slug, position: topPos, now },
          type: queryInterface.sequelize.QueryTypes.INSERT,
        },
      ).then(([rows]) => rows);

      let childPos = 0;
      for (const child of top.children) {
        await queryInterface.bulkInsert('categories', [
          {
            name: child.name,
            slug: child.slug,
            parent_id: parentId,
            position: childPos,
            created_at: now,
            updated_at: now,
          },
        ]);
        childPos += 1;
      }

      topPos += 1;
    }

    // eslint-disable-next-line no-console
    console.log(`[seed] categories seeded`);
  },

  async down(queryInterface) {
    // Children first via FK ON DELETE SET NULL would orphan; just truncate.
    await queryInterface.sequelize.query('TRUNCATE TABLE categories CASCADE;');
  },
};
