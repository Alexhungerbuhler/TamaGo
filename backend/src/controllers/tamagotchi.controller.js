const tamagotchiService = require('../services/tamagotchi.service');

async function getAll(req, res, next) {
  try {
    res.json(await tamagotchiService.getAll());
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    res.json(await tamagotchiService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    res.json(await tamagotchiService.create(req.body));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await tamagotchiService.update(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    res.json(await tamagotchiService.remove(req.params.id));
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, get, create, update, remove };