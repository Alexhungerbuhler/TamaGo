import Tamagotchi, { find, countDocuments, findById, findByIdAndUpdate, findByIdAndDelete } from '../models/Tamagotchi';

/**
 * Get all tamagotchis.
 * Usage:
 *   getAll(filter) -> returns array (backward-compatible)
 *   getAll(filter, { page, limit, sort }) -> returns { items, total, page, pages, limit }
 */
async function getAll(filter = {}, options = {}) {
  const page = options.page ? Math.max(1, parseInt(options.page, 10)) : null;
  const limit = options.limit ? Math.max(1, parseInt(options.limit, 10)) : null;
  const sort = options.sort || { createdAt: -1 };

  // No pagination requested -> keep old behavior (array)
  if (!page || !limit) {
    return find(filter).sort(sort);
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    find(filter).sort(sort).skip(skip).limit(limit),
    countDocuments(filter),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return { items, total, page, pages, limit };
}

async function getById(id) {
  return findById(id);
}

async function create(data) {
  return new Tamagotchi(data).save();
}

async function update(id, data) {
  return findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function remove(id) {
  return findByIdAndDelete(id);
}

export default { getAll, getById, create, update, remove };