import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import * as config from '../config.js';
import Tamagotchi from '../src/models/Tamagotchi.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.MONGO_URL || process.env.MONGO_URI || config.MONGO_URL || 'mongodb://localhost:27017/tamago';

// Coordonnées par défaut (Lausanne, Suisse)
const DEFAULT_LAT = 46.52;
const DEFAULT_LNG = 6.63;
const RADIUS = 0.05; // ~5km

async function main() {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connecté à MongoDB');

    const pets = await Tamagotchi.find({}).exec();
    console.log(`📊 Mise à jour de ${pets.length} pets...`);

    let updated = 0;
    for (const pet of pets) {
      // Ignorer les pets sans nom
      if (!pet.name || pet.name.trim() === '') {
        console.log(`   ⚠️  Pet ignoré (nom vide)`);
        continue;
      }

      // Générer des coordonnées aléatoires proches de la position par défaut
      const offsetLat = (Math.random() - 0.5) * RADIUS;
      const offsetLng = (Math.random() - 0.5) * RADIUS;

      pet.location = {
        type: 'Point',
        coordinates: [DEFAULT_LNG + offsetLng, DEFAULT_LAT + offsetLat]
      };

      await pet.save();
      updated++;
      console.log(`   ✓ ${pet.name} → [${pet.location.coordinates[1].toFixed(4)}, ${pet.location.coordinates[0].toFixed(4)}]`);
    }

    console.log(`\n✅ ${updated} pets mis à jour avec succès !`);
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
