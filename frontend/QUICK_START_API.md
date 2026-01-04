# 🚀 Quick Start - Services API TamaGo

## Démarrage rapide en 3 étapes

### 1️⃣ Vérifier la configuration

Le fichier `.env` doit contenir :
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 2️⃣ Démarrer le backend (terminal 1)
```bash
cd backend
npm start
```

### 3️⃣ Démarrer le frontend (terminal 2)
```bash
cd frontend
npm run dev
```

## 📝 Utilisation dans les composants

### Exemple 1: Authentification

```vue
<script setup>
import { useAuthStore } from '@/store/index';
import { ref } from 'vue';

const authStore = useAuthStore();
const name = ref('');
const password = ref('');

const handleLogin = async () => {
  try {
    await authStore.login(name.value, password.value);
    // Redirection après login
    router.push('/');
  } catch (error) {
    alert(error.message);
  }
};
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="name" placeholder="Nom">
    <input v-model="password" type="password" placeholder="Mot de passe">
    <button type="submit" :disabled="authStore.loading">
      {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</template>
```

### Exemple 2: Liste des Pets

```vue
<script setup>
import { usePetsStore } from '@/store/pets';
import { onMounted } from 'vue';

const petsStore = usePetsStore();

onMounted(async () => {
  await petsStore.fetchPets();
});

const handleFeed = async (petId) => {
  await petsStore.feedPet(petId);
};
</script>

<template>
  <div v-if="petsStore.isLoading">Chargement...</div>
  <div v-else>
    <div v-for="pet in petsStore.petsList" :key="pet._id">
      <h3>{{ pet.name }}</h3>
      <button @click="handleFeed(pet._id)">Nourrir 🍔</button>
    </div>
  </div>
</template>
```

### Exemple 3: Appel direct aux services

```vue
<script setup>
import { petsService, statsService } from '@/services/api';
import { ref, onMounted } from 'vue';

const stats = ref(null);

onMounted(async () => {
  try {
    const response = await statsService.getGlobal();
    stats.value = response.data;
  } catch (error) {
    console.error(error);
  }
});
</script>
```

## 🧪 Tester l'API

### Option 1: Console navigateur
1. Ouvrir DevTools (F12)
2. Dans la console:

```javascript
// Importer dans un composant puis accéder via window
import { petsService } from '@/services/api';
window.testPets = petsService;

// Puis dans la console
testPets.list().then(res => console.log(res.data));
```

### Option 2: Utiliser le script de test

Créer un composant temporaire:
```vue
<script setup>
import { testApiServices } from '@/services/testApi';
import { onMounted } from 'vue';

onMounted(() => {
  testApiServices();
});
</script>
```

## 🎯 Actions courantes

### Créer un pet
```javascript
import { usePetsStore } from '@/store/pets';

const petsStore = usePetsStore();
await petsStore.createPet({ 
  name: 'Fluffy', 
  species: 'cat' 
});
```

### Nourrir un pet
```javascript
await petsStore.feedPet(petId);
```

### Upload une image
```vue
<script setup>
import { usePetsStore } from '@/store/pets';

const petsStore = usePetsStore();

const handleImageUpload = async (event, petId) => {
  const file = event.target.files[0];
  if (file) {
    await petsStore.uploadPetImage(petId, file);
  }
};
</script>

<template>
  <input 
    type="file" 
    accept="image/*" 
    @change="handleImageUpload($event, petId)" 
  />
</template>
```

### Récupérer les stats
```javascript
import { useStatsStore } from '@/store/stats';

const statsStore = useStatsStore();
await statsStore.fetchGlobalStats();
console.log(statsStore.globalStats);
```

## ❗ Résolution de problèmes

### Erreur CORS
Vérifier dans le backend que CORS est bien configuré pour `http://localhost:5173`

### Erreur 401 (Unauthorized)
Le token a expiré ou est invalide. Se reconnecter.

### Erreur de connexion
1. Vérifier que le backend tourne sur le bon port
2. Vérifier le `.env` : `VITE_API_BASE_URL=http://localhost:3000`
3. Redémarrer le frontend après modification du `.env`

### Les pets ne s'affichent pas
1. Vérifier la console navigateur pour les erreurs
2. Vérifier que l'utilisateur est connecté (si route protégée)
3. Vérifier que des pets existent dans la DB

## 📚 Documentation complète

- [Service API Documentation](src/services/README.md)
- [Setup complet](SERVICE_API_SETUP.md)

## ✅ Checklist avant de coder

- [ ] Backend démarré et accessible
- [ ] `.env` configuré
- [ ] Frontend démarré
- [ ] Connexion/inscription testée
- [ ] Un pet créé pour tester

## 🎨 Composants disponibles

- `PetsList.vue` - Exemple complet de liste avec actions
- À créer selon vos besoins:
  - `TamagotchiDetail.vue`
  - `StatsDisplay.vue`
  - `MapView.vue`
  - etc.
