# Services API - Guide d'utilisation

Ce dossier contient les services API pour communiquer avec le backend TamaGo.

## Architecture

### Client Axios (`api.js`)

Configuration centralisée avec :
- **Base URL** : configurée via `VITE_API_BASE_URL` (env)
- **Intercepteurs JWT** : ajout automatique du token dans les headers
- **Gestion des erreurs** : redirection auto si 401, messages d'erreur formatés

### Services disponibles

#### 1. `authService` - Authentification
```javascript
import { authService } from '@/services/api';

// Inscription
await authService.register(name, password);

// Connexion
await authService.login(name, password);

// Déconnexion
await authService.logout();
```

#### 2. `petsService` - Gestion des Tamagotchis
```javascript
import { petsService } from '@/services/api';

// Liste avec filtres
const { data } = await petsService.list({ 
  userId: '123',
  page: 1,
  limit: 10,
  sort: 'name'
});

// Créer un pet
await petsService.create({ name: 'Fluffy', species: 'cat' });

// Récupérer un pet
const { data: pet } = await petsService.getById(petId);

// Supprimer un pet
await petsService.delete(petId);

// Actions
await petsService.feed(petId);
await petsService.toilet(petId);
await petsService.sleep(petId);
await petsService.play(petId);
await petsService.move(petId, { latitude: 48.8566, longitude: 2.3522 });

// Statistiques
const { data: stats } = await petsService.getStats(petId);

// Images
await petsService.uploadImage(petId, fileObject);
await petsService.deleteImage(petId);
```

#### 3. `statsService` - Statistiques
```javascript
import { statsService } from '@/services/api';

// Stats globales
const { data: globalStats } = await statsService.getGlobal();

// Stats utilisateur
const { data: userStats } = await statsService.getUserStats(userId);
```

#### 4. `worldService` - Carte du monde
```javascript
import { worldService } from '@/services/api';

const { data: map } = await worldService.getMap();
```

#### 5. `usersService` - Profil utilisateur
```javascript
import { usersService } from '@/services/api';

// Avatar
await usersService.uploadAvatar(fileObject);
await usersService.deleteAvatar();
```

#### 6. `tickService` - Système de tick
```javascript
import { tickService } from '@/services/api';

await tickService.trigger();
```

## Utilisation dans les composants

### Exemple avec Composition API
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { petsService } from '@/services/api';

const pets = ref([]);
const loading = ref(false);
const error = ref(null);

const loadPets = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data } = await petsService.list();
    pets.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Erreur:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPets();
});
</script>
```

### Exemple avec le store Pinia
```javascript
import { defineStore } from 'pinia';
import { petsService } from '@/services/api';

export const usePetsStore = defineStore('pets', () => {
  const pets = ref([]);
  const loading = ref(false);
  
  async function fetchPets(params) {
    loading.value = true;
    try {
      const { data } = await petsService.list(params);
      pets.value = data;
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
  
  return { pets, loading, fetchPets };
});
```

## Gestion des erreurs

Les erreurs sont automatiquement formatées :
```javascript
try {
  await petsService.create(petData);
} catch (error) {
  console.log(error.status);   // Code HTTP (ex: 400, 404, 500)
  console.log(error.message);  // Message d'erreur
  console.log(error.data);     // Données complètes de l'erreur
}
```

## Configuration

### Développement local
Fichier `.env` :
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production (Render)
Variables d'environnement Render :
```
VITE_API_BASE_URL=https://votre-api.onrender.com
```

## Intercepteurs

### Requête
- Ajoute automatiquement le token JWT dans le header `Authorization: Bearer <token>`
- Récupère le token depuis `localStorage.getItem('tamago_auth_token')`

### Réponse
- **200-299** : Retourne la réponse normalement
- **401** : Supprime le token et redirige vers `/login`
- **Autres erreurs** : Formate l'erreur avec status, message et data
