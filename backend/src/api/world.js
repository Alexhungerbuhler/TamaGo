import Tamagotchi from "../models/Tamagotchi.js";

export async function getWorldMap(_req, res, next) {
  try {
    const pets = await Tamagotchi.find({}, "name owner location level").lean();
    res.json(
      pets.map((pet) => ({
        id: pet._id,
        name: pet.name,
        owner: pet.owner,
        level: pet.level,
        location: pet.location,
      })),
    );
  } catch (err) {
    next(err);
  }
}

