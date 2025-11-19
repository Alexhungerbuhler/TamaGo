const tamagotchiService = require('../services/tamagotchi.service');

async function getAll(req, res, next) {
  try {
    // build filter from query (status, geolocation, other filters)
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    // exemple geolocation: ?lat=..&lng=..&radius=..
    if (req.query.lat && req.query.lng && req.query.radius) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(req.query.lng), parseFloat(req.query.lat)],
            parseFloat(req.query.radius) / 6378.1, // radius km -> radians
          ],
        },
      };
    }

    const options = {};
    if (req.query.page) options.page = req.query.page;
    if (req.query.limit) options.limit = req.query.limit;
    if (req.query.sort) options.sort = JSON.parse(req.query.sort); // optional: ?sort={"level":1}

    const result = await tamagotchiService.getAll(filter, options);
    res.json(result);
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