import Tamagotchi from "../models/Tamagotchi.js";
import { emitToUser, emitToAll } from "../websocket.js";

const MAX_STAT = 100;
const MIN_STAT = 0;

const clamp = (value) => Math.max(MIN_STAT, Math.min(MAX_STAT, value));

async function loadPet(petId) {
  return Tamagotchi.findById(petId).exec();
}

export async function listPets(req, res, next) {
  try {
    const filter = {};
    
    // Filtrage simple par propriétaire
    if (req.query.userId) {
      filter.owner = req.query.userId;
    }
    
    // Filtrage avancé par stats
    if (req.query.minLevel) {
      filter.level = { ...filter.level, $gte: parseInt(req.query.minLevel) };
    }
    if (req.query.maxLevel) {
      filter.level = { ...filter.level, $lte: parseInt(req.query.maxLevel) };
    }
    if (req.query.minHunger) {
      filter.hunger = { ...filter.hunger, $gte: parseInt(req.query.minHunger) };
    }
    if (req.query.maxHunger) {
      filter.hunger = { ...filter.hunger, $lte: parseInt(req.query.maxHunger) };
    }
    if (req.query.minEnergy) {
      filter.energy = { ...filter.energy, $gte: parseInt(req.query.minEnergy) };
    }
    if (req.query.maxEnergy) {
      filter.energy = { ...filter.energy, $lte: parseInt(req.query.maxEnergy) };
    }
    
    // Filtrage par nom (recherche partielle insensible à la casse)
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: "i" };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Compter le total pour la pagination
    const total = await Tamagotchi.countDocuments(filter);
    
    // Récupérer les pets avec pagination
    const pets = await Tamagotchi.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "name")
      .exec();
    
    // Réponse avec métadonnées de pagination
    res.json({
      data: pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createPet(req, res, next) {
  try {
    // Vérification de l'authentification
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const { name, lat, lng } = req.body;
    if (!name) {
      return res.status(400).send("name is required");
    }

    // Le propriétaire est toujours l'utilisateur authentifié
    const pet = await new Tamagotchi({
      name,
      owner: req.user._id,
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

export async function updatePet(req, res, next) {
  try {
    // Vérification de l'authentification
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const pet = await Tamagotchi.findById(req.params.id).exec();
    if (!pet) return res.sendStatus(404);
    
    // Vérifier que l'utilisateur est bien le propriétaire
    if (pet.owner && pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only update your own pets");
    }
    
    // Mettre à jour uniquement les champs autorisés
    const allowedFields = ['name', 'species', 'inclination', 'energy', 'fun', 'hunger', 'hygiene'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Clamper les stats entre 0 et 100
        if (['energy', 'fun', 'hunger', 'hygiene'].includes(field)) {
          pet[field] = clamp(req.body[field]);
        } else {
          pet[field] = req.body[field];
        }
      }
    });
    
    await pet.save();
    res.json(pet);
  } catch (err) {
    next(err);
  }
}

export async function deletePet(req, res, next) {
  try {
    // Vérification de l'authentification
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const pet = await Tamagotchi.findById(req.params.id).exec();
    if (!pet) return res.sendStatus(404);
    
    // Vérifier que l'utilisateur est bien le propriétaire
    if (pet.owner && pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only delete your own pets");
    }
    
    await pet.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

async function updateStats(petId, userId, updater) {
  const pet = await loadPet(petId);
  if (!pet) return null;
  
  // Vérifier que l'utilisateur est le propriétaire
  if (userId && pet.owner && pet.owner.toString() !== userId.toString()) {
    return { error: "forbidden", message: "You can only interact with your own pets" };
  }
  
  updater(pet);
  pet.hunger = clamp(pet.hunger);
  pet.hygiene = clamp(pet.hygiene);
  pet.energy = clamp(pet.energy);
  pet.fun = clamp(pet.fun);
  
  const savedPet = await pet.save();
  
  // Émettre un événement WebSocket pour notifier le propriétaire
  if (userId) {
    emitToUser(userId.toString(), 'pet:updated', {
      petId: savedPet._id,
      stats: {
        hunger: savedPet.hunger,
        hygiene: savedPet.hygiene,
        energy: savedPet.energy,
        fun: savedPet.fun,
        health: savedPet.health,
        happiness: savedPet.happiness
      }
    });
  }
  
  return savedPet;
}

export async function feedPet(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const updated = await updateStats(req.params.id, req.user._id, (pet) => {
      pet.hunger += 25;
    });
    
    if (!updated) return res.sendStatus(404);
    if (updated.error === "forbidden") {
      return res.status(403).send(updated.message);
    }
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function toiletPet(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const updated = await updateStats(req.params.id, req.user._id, (pet) => {
      pet.hygiene += 25;
    });
    
    if (!updated) return res.sendStatus(404);
    if (updated.error === "forbidden") {
      return res.status(403).send(updated.message);
    }
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function sleepPet(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const updated = await updateStats(req.params.id, req.user._id, (pet) => {
      pet.energy += 25;
    });
    
    if (!updated) return res.sendStatus(404);
    if (updated.error === "forbidden") {
      return res.status(403).send(updated.message);
    }
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function playPet(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const updated = await updateStats(req.params.id, req.user._id, (pet) => {
      pet.fun += 25;
      pet.energy -= 25;
      pet.hunger -= 25;
    });
    
    if (!updated) return res.sendStatus(404);
    if (updated.error === "forbidden") {
      return res.status(403).send(updated.message);
    }
    
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function movePet(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }
    
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).send("lat and lng numbers are required");
    }
    
    const pet = await loadPet(req.params.id);
    if (!pet) return res.sendStatus(404);
    
    // Vérifier que l'utilisateur est le propriétaire
    if (pet.owner && pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only move your own pets");
    }
    
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

