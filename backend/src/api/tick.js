import Tamagotchi from "../models/Tamagotchi.js";
import { emitToUser } from "../websocket.js";

const clamp = (value) => Math.max(0, Math.min(100, value));

// Fonction de tick commune (utilisée par l'API et le setInterval)
export async function executeTick() {
  try {
    const pets = await Tamagotchi.find().populate('owner').exec();
    let updatedCount = 0;

    for (const pet of pets) {
      const oldStats = {
        hunger: pet.hunger,
        hygiene: pet.hygiene,
        energy: pet.energy,
        fun: pet.fun
      };

      // Diminuer les stats automatiquement toutes les 5 minutes
      pet.hunger = clamp(pet.hunger - 25);   // -25 toutes les 5 minutes
      pet.hygiene = clamp(pet.hygiene - 25); // -25 toutes les 5 minutes
      // Energy ne diminue PAS automatiquement, seulement via les games
      pet.fun = clamp(pet.fun - 25);         // -25 toutes les 5 minutes
      
      await pet.save();
      updatedCount += 1;

      // Émettre la mise à jour via WebSocket
      if (pet.owner) {
        emitToUser(pet.owner._id.toString(), 'pet:updated', {
          petId: pet._id,
          stats: {
            hunger: pet.hunger,
            hygiene: pet.hygiene,
            energy: pet.energy,
            fun: pet.fun
          }
        });

        // Vérifier les alertes critiques
        if (pet.hunger < 25 || pet.hygiene < 25 || pet.energy < 25 || pet.fun < 25) {
          const criticalStats = [];
          if (pet.hunger < 25) criticalStats.push('Hunger');
          if (pet.hygiene < 25) criticalStats.push('Hygiene');
          if (pet.energy < 25) criticalStats.push('Energy');
          if (pet.fun < 25) criticalStats.push('Fun');

          emitToUser(pet.owner._id.toString(), 'pet:alert', {
            petId: pet._id,
            name: pet.name,
            type: criticalStats.join(', '),
            message: `⚠️ ${pet.name} needs attention! Low ${criticalStats.join(', ')}`
          });
        }
      }
    }

    return { updated: updatedCount };
  } catch (err) {
    console.error('Error executing tick:', err);
    throw err;
  }
}

// Endpoint API pour déclencher manuellement le tick
export async function manualTick(_req, res, next) {
  try {
    const result = await executeTick();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

