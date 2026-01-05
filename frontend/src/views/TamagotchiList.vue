<template>
  <div class="tamagotchi-list-page">
    <Header />
    
    <div class="container">
      <h1>🐣 Mes Tamagotchis</h1>
      
      <!-- Filtres -->
      <div class="filters">
        <div class="filter-group">
          <label for="species">Espèce :</label>
          <select id="species" v-model="filters.species" @change="applyFilters">
            <option value="">Toutes</option>
            <option value="cat">🐱 Chat</option>
            <option value="dog">🐶 Chien</option>
            <option value="bird">🐦 Oiseau</option>
            <option value="dragon">🐉 Dragon</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="inclination">Inclination :</label>
          <select id="inclination" v-model="filters.inclination" @change="applyFilters">
            <option value="">Toutes</option>
            <option value="aggressive">⚔️ Agressif</option>
            <option value="neutral">😐 Neutre</option>
            <option value="friendly">😊 Amical</option>
          </select>
        </div>
        
        <button v-if="hasActiveFilters" @click="resetFilters" class="reset-btn">
          ✖️ Réinitialiser
        </button>
      </div>
      
      <!-- Composant liste -->
      <PetsList :filters="activeFilters" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from '@/components/Header.vue';
import PetsList from '@/components/PetsList.vue';

// State des filtres
const filters = ref({
  species: '',
  inclination: ''
});

const activeFilters = ref({});

// Computed
const hasActiveFilters = computed(() => {
  return filters.value.species !== '' || filters.value.inclination !== '';
});

// Appliquer les filtres
function applyFilters() {
  const newFilters = {};
  
  if (filters.value.species) {
    newFilters.species = filters.value.species;
  }
  
  if (filters.value.inclination) {
    newFilters.inclination = filters.value.inclination;
  }
  
  activeFilters.value = newFilters;
}

// Réinitialiser les filtres
function resetFilters() {
  filters.value.species = '';
  filters.value.inclination = '';
  activeFilters.value = {};
}
</script>

<style scoped>
.tamagotchi-list-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-group select:hover {
  border-color: #667eea;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.reset-btn {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  align-self: flex-end;
}

.reset-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
    min-width: unset;
  }
  
  .reset-btn {
    width: 100%;
  }
}
</style>