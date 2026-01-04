<template>
  <div class="api-test-panel">
    <h2>🧪 Test des Services API</h2>
    
    <div class="test-section">
      <h3>1. Test Authentification</h3>
      <div class="test-controls">
        <input v-model="testUser.name" placeholder="Nom d'utilisateur" />
        <input v-model="testUser.password" type="password" placeholder="Mot de passe" />
        <button @click="testRegister">S'inscrire</button>
        <button @click="testLogin">Se connecter</button>
        <button @click="testLogout">Se déconnecter</button>
      </div>
      <div v-if="authResult" class="result">
        {{ authResult }}
      </div>
    </div>

    <div class="test-section">
      <h3>2. Test Pets</h3>
      <div class="test-controls">
        <input v-model="newPetName" placeholder="Nom du pet" />
        <select v-model="newPetSpecies">
          <option value="cat">Chat</option>
          <option value="dog">Chien</option>
          <option value="bird">Oiseau</option>
        </select>
        <button @click="testCreatePet">Créer un pet</button>
        <button @click="testListPets">Liste des pets</button>
      </div>
      <div v-if="petsResult" class="result">
        <pre>{{ JSON.stringify(petsResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>3. Test Actions sur Pet</h3>
      <div v-if="testPetId" class="test-controls">
        <p>Pet ID: {{ testPetId }}</p>
        <button @click="testFeedPet">🍔 Nourrir</button>
        <button @click="testPlayPet">🎮 Jouer</button>
        <button @click="testToiletPet">🚽 Toilette</button>
        <button @click="testSleepPet">😴 Dormir</button>
        <button @click="testGetPetStats">📊 Stats</button>
      </div>
      <div v-else class="info">
        Créez d'abord un pet pour tester les actions
      </div>
      <div v-if="actionResult" class="result">
        <pre>{{ JSON.stringify(actionResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>4. Test Stats Globales</h3>
      <div class="test-controls">
        <button @click="testGlobalStats">Récupérer les stats globales</button>
      </div>
      <div v-if="statsResult" class="result">
        <pre>{{ JSON.stringify(statsResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>5. Informations Stores</h3>
      <div class="store-info">
        <p><strong>Auth:</strong> {{ authStore.isAuthenticated ? '✅ Connecté' : '❌ Non connecté' }}</p>
        <p v-if="authStore.currentUser"><strong>User:</strong> {{ authStore.currentUser.name }}</p>
        <p><strong>Pets en store:</strong> {{ petsStore.petsList.length }}</p>
      </div>
    </div>

    <div v-if="error" class="error-box">
      ❌ Erreur: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/index';
import { usePetsStore } from '@/store/pets';
import { useStatsStore } from '@/store/stats';
import { petsService, statsService } from '@/services/api';

const authStore = useAuthStore();
const petsStore = usePetsStore();
const statsStore = useStatsStore();

// State
const testUser = ref({
  name: `test_${Date.now()}`,
  password: 'Test123!'
});

const newPetName = ref('TestPet');
const newPetSpecies = ref('cat');
const testPetId = ref(null);

const authResult = ref('');
const petsResult = ref(null);
const actionResult = ref(null);
const statsResult = ref(null);
const error = ref('');

// Test functions
const testRegister = async () => {
  try {
    error.value = '';
    // Générer un nouveau nom d'utilisateur unique à chaque tentative
    testUser.value.name = `test_${Date.now()}`;
    const result = await authStore.register(testUser.value.name, testUser.value.password);
    
    if (result.token) {
      authResult.value = `✅ Inscription réussie! Token: ${result.token.substring(0, 20)}...`;
    } else {
      authResult.value = `✅ Inscription réussie! User: ${testUser.value.name}`;
    }
  } catch (err) {
    error.value = err.message;
    authResult.value = '❌ Échec inscription';
  }
};

const testLogin = async () => {
  try {
    error.value = '';
    const result = await authStore.login(testUser.value.name, testUser.value.password);
    authResult.value = `✅ Connexion réussie! User: ${result.user?.name || testUser.value.name}`;
  } catch (err) {
    error.value = err.message;
    authResult.value = '❌ Échec connexion';
  }
};

const testLogout = async () => {
  try {
    error.value = '';
    await authStore.logout();
    authResult.value = '✅ Déconnexion réussie';
    testPetId.value = null;
  } catch (err) {
    error.value = err.message;
  }
};

const testCreatePet = async () => {
  try {
    error.value = '';
    const pet = await petsStore.createPet({
      name: newPetName.value,
      species: newPetSpecies.value
    });
    testPetId.value = pet._id || pet.id;
    petsResult.value = pet;
  } catch (err) {
    error.value = err.message;
  }
};

const testListPets = async () => {
  try {
    error.value = '';
    await petsStore.fetchPets();
    petsResult.value = {
      count: petsStore.petsList.length,
      pets: petsStore.petsList
    };
  } catch (err) {
    error.value = err.message;
  }
};

const testFeedPet = async () => {
  try {
    error.value = '';
    const result = await petsStore.feedPet(testPetId.value);
    actionResult.value = { action: 'feed', result };
  } catch (err) {
    error.value = err.message;
  }
};

const testPlayPet = async () => {
  try {
    error.value = '';
    const result = await petsStore.playWithPet(testPetId.value);
    actionResult.value = { action: 'play', result };
  } catch (err) {
    error.value = err.message;
  }
};

const testToiletPet = async () => {
  try {
    error.value = '';
    const result = await petsStore.toiletPet(testPetId.value);
    actionResult.value = { action: 'toilet', result };
  } catch (err) {
    error.value = err.message;
  }
};

const testSleepPet = async () => {
  try {
    error.value = '';
    const result = await petsStore.sleepPet(testPetId.value);
    actionResult.value = { action: 'sleep', result };
  } catch (err) {
    error.value = err.message;
  }
};

const testGetPetStats = async () => {
  try {
    error.value = '';
    const response = await petsService.getStats(testPetId.value);
    actionResult.value = { action: 'stats', result: response.data };
  } catch (err) {
    error.value = err.message;
  }
};

const testGlobalStats = async () => {
  try {
    error.value = '';
    await statsStore.fetchGlobalStats();
    statsResult.value = statsStore.globalStats;
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<style scoped>
.api-test-panel {
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

.api-test-panel h2 {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 0.5rem;
}

.test-section {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

.test-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.test-controls input,
.test-controls select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.test-controls button {
  padding: 0.5rem 1rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.test-controls button:hover {
  background: #1565c0;
}

.test-controls button:active {
  transform: scale(0.98);
}

.result {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  font-size: 0.85rem;
  white-space: pre-wrap;
}

.info {
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
}

.store-info {
  background: white;
  padding: 1rem;
  border-radius: 4px;
}

.store-info p {
  margin: 0.5rem 0;
}

.error-box {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: #f44336;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  max-width: 400px;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
