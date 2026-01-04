# 📦 Structure des Services API - TamaGo Frontend

## 📂 Fichiers créés/modifiés

```
frontend/
├── src/
│   ├── services/
│   │   ├── api.js                  ✨ NOUVEAU - Client axios + tous les services
│   │   ├── README.md               ✨ NOUVEAU - Documentation complète
│   │   └── testApi.js              ✨ NOUVEAU - Scripts de test
│   │
│   ├── store/
│   │   ├── index.js                ✏️ MODIFIÉ - Store auth migré vers axios
│   │   ├── pets.js                 ✨ NOUVEAU - Store complet pour les pets
│   │   └── stats.js                ✨ NOUVEAU - Store pour les statistiques
│   │
│   └── components/
│       ├── PetsList.vue            ✨ NOUVEAU - Exemple d'utilisation complète
│       └── ApiTestPanel.vue        ✨ NOUVEAU - Panel de test interactif
│
├── .env                             ✏️ EXISTANT - Configuration API
├── SERVICE_API_SETUP.md            ✨ NOUVEAU - Documentation setup
└── QUICK_START_API.md              ✨ NOUVEAU - Guide démarrage rapide
```

## 🎯 Fichiers principaux

### 1. [src/services/api.js](src/services/api.js)
**Le cœur du système API**
- Client axios configuré
- Intercepteurs JWT
- 6 services exportés:
  - `authService` (register, login, logout)
  - `petsService` (CRUD + actions + upload)
  - `statsService` (global, user)
  - `worldService` (map)
  - `usersService` (avatar)
  - `tickService` (trigger)

### 2. [src/store/index.js](src/store/index.js)
**Store d'authentification (migré)**
- Utilise `authService` au lieu de `fetch`
- Gestion du token JWT
- Persistance localStorage
- Actions: login, register, logout

### 3. [src/store/pets.js](src/store/pets.js)
**Store de gestion des pets (nouveau)**
- État complet (pets, currentPet, loading, error, pagination)
- Actions CRUD complètes
- Actions d'interaction (feed, play, sleep, toilet, move)
- Gestion d'images

### 4. [src/store/stats.js](src/store/stats.js)
**Store de statistiques (nouveau)**
- Stats globales
- Stats utilisateur
- Rafraîchissement automatique

## 🔧 Configuration

### Variables d'environnement
```env
# .env
VITE_API_BASE_URL=http://localhost:3000
```

### Clés localStorage
```javascript
tamago_auth_token  // Token JWT
tamago_user        // Données utilisateur
```

## 📋 Checklist d'utilisation

### Pour commencer
1. ✅ Backend démarré sur port 3000
2. ✅ Frontend démarré (`npm run dev`)
3. ✅ `.env` configuré avec la bonne URL

### Tester l'installation
Option 1: Utiliser le composant de test
```vue
<!-- Dans App.vue ou une route -->
<template>
  <ApiTestPanel />
</template>

<script setup>
import ApiTestPanel from '@/components/ApiTestPanel.vue';
</script>
```

Option 2: Tester depuis la console
```javascript
// Dans la console DevTools après avoir importé dans un composant
import { testApiServices } from '@/services/testApi';
testApiServices();
```

## 💡 Exemples d'utilisation

### Utilisation avec les stores (recommandé)
```vue
<script setup>
import { usePetsStore } from '@/store/pets';
import { useAuthStore } from '@/store/index';
import { onMounted } from 'vue';

const petsStore = usePetsStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await petsStore.fetchPets();
  }
});
</script>

<template>
  <div v-for="pet in petsStore.petsList" :key="pet._id">
    {{ pet.name }}
  </div>
</template>
```

### Utilisation directe des services
```vue
<script setup>
import { petsService } from '@/services/api';
import { ref, onMounted } from 'vue';

const pets = ref([]);

onMounted(async () => {
  const response = await petsService.list();
  pets.value = response.data;
});
</script>
```

## 🚦 Gestion des erreurs

### Automatique (intercepteur)
- 401: Redirection auto vers `/login`
- Token expiré: Nettoyage du localStorage

### Manuelle
```javascript
try {
  await petsStore.createPet(data);
} catch (error) {
  console.error('Code:', error.status);
  console.error('Message:', error.message);
  console.error('Data:', error.data);
}
```

## 📊 Endpoints disponibles

### Auth
- POST `/auth/register` - Inscription
- POST `/auth/login` - Connexion
- POST `/auth/logout` - Déconnexion

### Pets
- GET `/pets` - Liste (avec filtres)
- POST `/pets` - Créer
- GET `/pets/:id` - Détails
- DELETE `/pets/:id` - Supprimer
- POST `/pets/:id/eat` - Nourrir
- POST `/pets/:id/play` - Jouer
- POST `/pets/:id/sleep` - Dormir
- POST `/pets/:id/toilet` - Toilette
- POST `/pets/:id/move` - Déplacer
- GET `/pets/:id/stats` - Statistiques
- POST `/pets/:id/image` - Upload image
- DELETE `/pets/:id/image` - Supprimer image

### Stats
- GET `/stats` - Globales
- GET `/stats/users/:userId` - Utilisateur

### World
- GET `/world/map` - Carte

### Users
- POST `/users/avatar` - Upload avatar
- DELETE `/users/avatar` - Supprimer avatar

### Tick
- POST `/tick` - Trigger manuel

## 🎨 Composants disponibles

### ApiTestPanel.vue
Panel de test interactif pour vérifier tous les services
- Tests d'authentification
- Tests CRUD pets
- Tests actions pets
- Tests stats
- Affichage des erreurs

### PetsList.vue
Exemple complet d'utilisation avec:
- Liste paginée
- Actions rapides
- Modal de création
- Gestion des états (loading, error, empty)

## 📚 Documentation

1. [SERVICE_API_SETUP.md](SERVICE_API_SETUP.md) - Setup complet et détaillé
2. [QUICK_START_API.md](QUICK_START_API.md) - Guide rapide
3. [src/services/README.md](src/services/README.md) - Doc des services
4. Ce fichier - Vue d'ensemble de la structure

## ✅ Ce qui est prêt à utiliser

- ✅ Client axios configuré avec intercepteurs
- ✅ Tous les services API implémentés
- ✅ Store auth migré et fonctionnel
- ✅ Store pets complet
- ✅ Store stats complet
- ✅ Composants exemples
- ✅ Scripts de test
- ✅ Documentation complète

## 🚀 Prochaines étapes recommandées

1. **Tester l'API** avec ApiTestPanel
2. **Créer les vues principales**:
   - TamagotchiDetail.vue
   - TamagotchiList.vue (basé sur PetsList)
   - Profile.vue
3. **Ajouter les features temps réel**:
   - WebSocket pour les updates
   - Polling pour les stats
4. **Optimiser l'UX**:
   - Loading states
   - Error handling
   - Animations
5. **Déployer sur Render**

## ⚠️ Points d'attention

1. **CORS**: Vérifier la config backend si erreurs
2. **Token**: Expire après un certain temps
3. **Upload**: Max size à vérifier côté backend
4. **Pagination**: Bien gérer les pages vides
5. **Mobile**: Tester sur mobile (responsive)

## 🔗 Liens utiles

- Backend API: `http://localhost:3000`
- Frontend Dev: `http://localhost:5173`
- Documentation Axios: https://axios-http.com/
- Documentation Pinia: https://pinia.vuejs.org/
