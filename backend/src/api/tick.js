import Tamagotchi from "../models/Tamagotchi.js";
import { emitToUser } from "../websocket.js";
import notificationService from "../services/notificationService.js";

const clamp = (value) => Math.max(0, Math.min(100, value));

// Fonction de tick commune (utilisée par l'API et le setInterval)
export async function executeTick() {
  try {
    const pets = await Tamagotchi.find().populate('owner').exec();
    let updatedCount = 0;

    for (const pet of pets) {
      // Skip pets without a name (they haven't been properly initialized)
      if (!pet.name || pet.name.trim() === '') {
        continue;
      }

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
      // pet.energy reste inchangé ici
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

        // Analyser les stats et envoyer des notifications si nécessaire
        const notifications = notificationService.analyzeStats(pet, oldStats);
        notifications.forEach(notification => {
          emitToUser(pet.owner._id.toString(), 'notification:new', notification);
        });
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

