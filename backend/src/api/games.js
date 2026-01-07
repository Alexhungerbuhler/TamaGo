import Tamagotchi from "../models/Tamagotchi.js";
import { emitToUser } from "../websocket.js";

const MAX_STAT = 100;
const MIN_STAT = 0;

const clamp = (value) => Math.max(MIN_STAT, Math.min(MAX_STAT, value));

// Liste des jeux disponibles
const availableGames = [
  {
    id: "memory-game",
    name: "Memory Game",
    description: "Test your memory by matching pairs of cards!",
    icon: "🧠",
    funBonus: 20,
    energyCost: 10,
    hungerCost: 5,
    difficulty: "easy"
  },
  {
    id: "doodle-jump",
    name: "Doodle Jump",
    description: "Jump as high as you can without falling!",
    icon: "🦘",
    funBonus: 25,
    energyCost: 15,
    hungerCost: 8,
    difficulty: "medium"
  },
  {
    id: "catch-game",
    name: "Catch the Stars",
    description: "Catch falling stars to earn points!",
    icon: "⭐",
    funBonus: 18,
    energyCost: 12,
    hungerCost: 6,
    difficulty: "easy"
  },
  {
    id: "puzzle-game",
    name: "Puzzle Master",
    description: "Solve puzzles to challenge your brain!",
    icon: "🧩",
    funBonus: 22,
    energyCost: 8,
    hungerCost: 4,
    difficulty: "hard"
  }
];

/**
 * GET /api/games
 * Liste tous les jeux disponibles
 */
export async function listGames(req, res, next) {
  try {
    res.status(200).json({
      games: availableGames,
      count: availableGames.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/games/:gameId
 * Obtenir les détails d'un jeu spécifique
 */
export async function getGame(req, res, next) {
  try {
    const { gameId } = req.params;
    
    const game = availableGames.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/pets/:id/play-game
 * Jouer à un jeu avec un Tamagotchi
 * Body: { gameId: string, score?: number }
 */
export async function playGame(req, res, next) {
  try {
    const { id: petId } = req.params;
    const { gameId, score = 0 } = req.body;
    
    // Vérifier que le jeu existe
    const game = availableGames.find(g => g.id === gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    // Charger le Tamagotchi
    const pet = await Tamagotchi.findById(petId).exec();
    if (!pet) {
      return res.status(404).json({ message: "Tamagotchi not found" });
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    if (req.user && pet.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to play with this Tamagotchi" });
    }
    
    // Vérifier si le Tamagotchi a assez d'énergie
    if (pet.energy < game.energyCost) {
      return res.status(400).json({ 
        message: "Not enough energy to play this game",
        required: game.energyCost,
        current: pet.energy
      });
    }
    
    // Calculer les bonus en fonction du score (optionnel)
    let funBonus = game.funBonus;
    if (score > 0) {
      // Bonus supplémentaire si le score est élevé
      const scoreMultiplier = Math.min(score / 100, 1.5); // Max 1.5x
      funBonus = Math.round(funBonus * scoreMultiplier);
    }
    
    // Mettre à jour les stats
    const oldStats = {
      fun: pet.fun,
      energy: pet.energy,
      hunger: pet.hunger
    };
    
    pet.fun = clamp(pet.fun + funBonus);
    pet.energy = clamp(pet.energy - game.energyCost);
    pet.hunger = clamp(pet.hunger - game.hungerCost);
    
    await pet.save();
    
    // Émettre la mise à jour via WebSocket
    if (req.user) {
      emitToUser(req.user.id, "pet:updated", {
        petId: pet._id.toString(),
        stats: {
          fun: pet.fun,
          energy: pet.energy,
          hunger: pet.hunger,
          hygiene: pet.hygiene
        }
      });
      
      // Notification de jeu terminé
      emitToUser(req.user.id, "game:completed", {
        petId: pet._id.toString(),
        petName: pet.name,
        gameId: game.id,
        gameName: game.name,
        funGained: pet.fun - oldStats.fun,
        energyLost: oldStats.energy - pet.energy,
        hungerLost: oldStats.hunger - pet.hunger,
        score
      });
    }
    
    res.status(200).json({
      message: `${pet.name} played ${game.name}!`,
      game: {
        id: game.id,
        name: game.name
      },
      score,
      stats: {
        fun: pet.fun,
        energy: pet.energy,
        hunger: pet.hunger,
        hygiene: pet.hygiene
      },
      changes: {
        fun: pet.fun - oldStats.fun,
        energy: pet.energy - oldStats.energy,
        hunger: pet.hunger - oldStats.hunger
      }
    });
  } catch (err) {
    next(err);
  }
}
