import Tamagotchi from "../models/Tamagotchi.js";

const MAX_STAT = 100;
const MIN_STAT = 0;

const clamp = (value) => Math.max(MIN_STAT, Math.min(MAX_STAT, value));

async function loadPet(petId) {
  return Tamagotchi.findById(petId).exec();
}

export async function listPets(req, res, next) {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.owner = req.query.userId;
    }
    const pets = await Tamagotchi.find(filter).exec();
    res.json(pets);
  } catch (err) {
    next(err);
  }
}

export async function createPet(req, res, next) {
  try {
    const { name, userId, lat, lng } = req.body;
    if (!name) {
      return res.status(400).send("name is required");
    }

    const pet = await new Tamagotchi({
      name,
      owner: userId || null,
      location: {
        type: "Point",
        coordinates: [
          typeof lng === "number" ? lng : 0,
          typeof lat === "number" ? lat : 0,
        ],
      },
    }).save();

    res.status(201).json(pet);
  } catch (err) {
    next(err);
  }
}

export async function getPet(req, res, next) {
  try {
    const pet = await loadPet(req.params.id);
    if (!pet) return res.sendStatus(404);
    res.json(pet);
  } catch (err) {
    next(err);
  }
}

export async function deletePet(req, res, next) {
  try {
    const pet = await Tamagotchi.findByIdAndDelete(req.params.id).exec();
    if (!pet) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function updateStats(petId, updater) {
  const pet = await loadPet(petId);
  if (!pet) return null;
  updater(pet);
  pet.hunger = clamp(pet.hunger);
  pet.hygiene = clamp(pet.hygiene);
  pet.energy = clamp(pet.energy);
  pet.fun = clamp(pet.fun);
  return pet.save();
}

export async function feedPet(req, res, next) {
  try {
    const updated = await updateStats(req.params.id, (pet) => {
      pet.hunger += 30;
    });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function toiletPet(req, res, next) {
  try {
    const updated = await updateStats(req.params.id, (pet) => {
      pet.hygiene = MAX_STAT;
    });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function sleepPet(req, res, next) {
  try {
    const updated = await updateStats(req.params.id, (pet) => {
      pet.energy += 40;
      pet.hunger -= 10;
    });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function playPet(req, res, next) {
  try {
    const updated = await updateStats(req.params.id, (pet) => {
      pet.fun += 25;
      pet.energy -= 20;
      pet.hunger -= 15;
    });
    if (!updated) return res.sendStatus(404);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function movePet(req, res, next) {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).send("lat and lng numbers are required");
    }
    const pet = await loadPet(req.params.id);
    if (!pet) return res.sendStatus(404);
    pet.location = { type: "Point", coordinates: [lng, lat] };
    const updated = await pet.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getPetStats(req, res, next) {
  try {
    const pet = await loadPet(req.params.id);
    if (!pet) return res.sendStatus(404);
    res.json({
      hunger: pet.hunger,
      hygiene: pet.hygiene,
      energy: pet.energy,
      fun: pet.fun,
    });
  } catch (err) {
    next(err);
  }
}

