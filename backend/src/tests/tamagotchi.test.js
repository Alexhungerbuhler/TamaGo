const mongoose = require('mongoose');
const Tamagotchi = require('../models/Tamagotchi');
const tamagotchiService = require('../services/tamagotchi.service').default;

beforeEach(async () => {
  // clear collection before each test
  await Tamagotchi.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

test('getAll without pagination returns array (backward-compatible)', async () => {
  await Tamagotchi.create({ name: 'A' });
  const res = await tamagotchiService.getAll({});
  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBe(1);
});

test('pagination: returns items and metadata', async () => {
  // create 25 entries
  const bulk = [];
  for (let i = 0; i < 25; i++) {
    bulk.push({ name: `Tama${i}`, level: i });
  }
  await Tamagotchi.insertMany(bulk);

  const result = await tamagotchiService.getAll({}, { page: 2, limit: 10, sort: { level: 1 } });

  expect(result).toHaveProperty('items');
  expect(result).toHaveProperty('total', 25);
  expect(result).toHaveProperty('page', 2);
  expect(result).toHaveProperty('pages', 3);
  expect(result).toHaveProperty('limit', 10);
  expect(Array.isArray(result.items)).toBe(true);
  expect(result.items.length).toBe(10);
  // verify ordering by level asc for sanity
  expect(result.items[0].level).toBe(10);
  expect(result.items[9].level).toBe(19);
});