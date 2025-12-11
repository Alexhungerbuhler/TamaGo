import Tamagotchi from "../models/Tamagotchi.js";

const clamp = (value) => Math.max(0, Math.min(100, value));

export async function manualTick(_req, res, next) {
  try {
    const pets = await Tamagotchi.find().exec();
    let updatedCount = 0;

    for (const pet of pets) {
      pet.hunger = clamp(pet.hunger - 5);
      pet.hygiene = clamp(pet.hygiene - 5);
      pet.energy = clamp(pet.energy - 5);
      pet.fun = clamp(pet.fun - 5);
      await pet.save();
      updatedCount += 1;
    }

    res.json({ updated: updatedCount });
  } catch (err) {
    next(err);
  }
}

