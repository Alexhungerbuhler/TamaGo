const Tamagotchi = require('../models/Tamagotchi');

async function getAll() {
    return Tamagotchi.find();
}

async function getById(id) {
    return Tamagotchi.findById(id);
}

async function create(data) {
    const t = new Tamagotchi(data);
    return t.save();
}

async function update(id, data) {
    return Tamagotchi.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function remove(id) {
    return Tamagotchi.findByIdAndDelete(id);
}

module.exports = { getAll, getById, create, update, remove };