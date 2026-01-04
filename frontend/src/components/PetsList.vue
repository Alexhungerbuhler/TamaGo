<template>
  <div class="pets-list">
    <h2>Mes Tamagotchis</h2>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      Chargement...
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="retry">Réessayer</button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!pets.length" class="empty">
      <p>Vous n'avez pas encore de Tamagotchi</p>
      <button @click="showCreateForm = true">Créer mon premier Tamagotchi</button>
    </div>
    
    <!-- Pets list -->
    <div v-else class="pets-grid">
      <div 
        v-for="pet in pets" 
        :key="pet._id || pet.id" 
        class="pet-card"
        @click="selectPet(pet)"
      >
        <img 
          v-if="pet.imageUrl" 
          :src="pet.imageUrl" 
          :alt="pet.name"
          class="pet-image"
        >
        <div class="pet-info">
          <h3>{{ pet.name }}</h3>
          <p class="species">{{ pet.species }}</p>
          
          <!-- Stats bars -->
          <div class="stats">
            <div class="stat">
              <span>❤️ Santé</span>
              <div class="bar">
                <div 
                  class="fill health" 
                  :style="{ width: pet.health + '%' }"
                ></div>
              </div>
            </div>
            <div class="stat">
              <span>😊 Bonheur</span>
              <div class="bar">
                <div 
                  class="fill happiness" 
                  :style="{ width: pet.happiness + '%' }"
                ></div>
              </div>
            </div>
            <div class="stat">
              <span>🍔 Faim</span>
              <div class="bar">
                <div 
                  class="fill hunger" 
                  :style="{ width: pet.hunger + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Actions rapides -->
          <div class="quick-actions">
            <button @click.stop="feedPet(pet)" title="Nourrir">🍔</button>
            <button @click.stop="playWithPet(pet)" title="Jouer">🎮</button>
            <button @click.stop="toiletPet(pet)" title="Toilettes">🚽</button>
            <button @click.stop="sleepPet(pet)" title="Dormir">😴</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="pets.length && pagination.total > pagination.limit" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="pagination.page === 1"
      >
        Précédent
      </button>
      <span>Page {{ pagination.page }} / {{ totalPages }}</span>
      <button 
        @click="nextPage" 
        :disabled="!pagination.hasMore"
      >
        Suivant
      </button>
    </div>
    
    <!-- Create form modal -->
    <div v-if="showCreateForm" class="modal">
      <div class="modal-content">
        <h3>Créer un nouveau Tamagotchi</h3>
        <form @submit.prevent="createNewPet">
          <input 
            v-model="newPet.name" 
            type="text" 
            placeholder="Nom" 
            required
          >
          <select v-model="newPet.species" required>
            <option value="">Choisir une espèce</option>
            <option value="cat">Chat</option>
            <option value="dog">Chien</option>
            <option value="bird">Oiseau</option>
            <option value="dragon">Dragon</option>
          </select>
          <div class="modal-actions">
            <button type="button" @click="showCreateForm = false">Annuler</button>
            <button type="submit" :disabled="loading">Créer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePetsStore } from '@/store/pets';
import { useRouter } from 'vue-router';

const router = useRouter();
const petsStore = usePetsStore();

// State local
const showCreateForm = ref(false);
const newPet = ref({
  name: '',
  species: ''
});

// Computed depuis le store
const pets = computed(() => petsStore.petsList);
const isLoading = computed(() => petsStore.isLoading);
const error = computed(() => petsStore.error);
const pagination = computed(() => petsStore.pagination);

const totalPages = computed(() => 
  Math.ceil(pagination.value.total / pagination.value.limit)
);

// Actions
const loadPets = async () => {
  try {
    await petsStore.fetchPets();
  } catch (err) {
    console.error('Erreur chargement pets:', err);
  }
};

const retry = () => {
  petsStore.clearError();
  loadPets();
};

const createNewPet = async () => {
  try {
    await petsStore.createPet(newPet.value);
    showCreateForm.value = false;
    newPet.value = { name: '', species: '' };
  } catch (err) {
    alert(err.message);
  }
};

const selectPet = (pet) => {
  router.push(`/pets/${pet._id || pet.id}`);
};

const feedPet = async (pet) => {
  try {
    await petsStore.feedPet(pet._id || pet.id);
  } catch (err) {
    alert(err.message);
  }
};

const playWithPet = async (pet) => {
  try {
    await petsStore.playWithPet(pet._id || pet.id);
  } catch (err) {
    alert(err.message);
  }
};

const toiletPet = async (pet) => {
  try {
    await petsStore.toiletPet(pet._id || pet.id);
  } catch (err) {
    alert(err.message);
  }
};

const sleepPet = async (pet) => {
  try {
    await petsStore.sleepPet(pet._id || pet.id);
  } catch (err) {
    alert(err.message);
  }
};

const nextPage = async () => {
  petsStore.setPage(pagination.value.page + 1);
  await loadPets();
};

const prevPage = async () => {
  petsStore.setPage(pagination.value.page - 1);
  await loadPets();
};

onMounted(() => {
  loadPets();
});
</script>

<style scoped>
.pets-list {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #d32f2f;
}

.error button {
  margin-top: 1rem;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.pet-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pet-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.pet-info h3 {
  margin: 0 0 0.25rem 0;
}

.species {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  text-transform: capitalize;
}

.stats {
  margin-bottom: 1rem;
}

.stat {
  margin-bottom: 0.5rem;
}

.stat span {
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.25rem;
}

.bar {
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s;
}

.fill.health {
  background: #4caf50;
}

.fill.happiness {
  background: #ffc107;
}

.fill.hunger {
  background: #ff5722;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: space-around;
}

.quick-actions button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-actions button:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

.quick-actions button:active {
  transform: scale(0.95);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 300px;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-content input,
.modal-content select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #1565c0;
}

button[type="button"] {
  background: #757575;
}

button[type="button"]:hover {
  background: #616161;
}
</style>
