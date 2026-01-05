<template>
  <div class="tamagotchi-detail-page">
    <Header />
    
    <div class="container">
      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Chargement...</p>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <h2>❌ Erreur</h2>
        <p>{{ error }}</p>
        <button @click="loadPet">Réessayer</button>
        <button @click="goBack" class="secondary">Retour</button>
      </div>
      
      <!-- Pet Detail -->
      <div v-else-if="pet" class="pet-detail">
        <!-- Header avec bouton retour -->
        <div class="detail-header">
          <button @click="goBack" class="back-btn">← Retour</button>
          <button v-if="!isEditing" @click="startEdit" class="edit-btn">✏️ Éditer</button>
          <button v-else @click="cancelEdit" class="cancel-btn">✖️ Annuler</button>
        </div>
        
        <!-- Mode Affichage -->
        <div v-if="!isEditing" class="view-mode">
          <div class="pet-header">
            <div class="pet-image-container">
              <img 
                v-if="pet.imageUrl" 
                :src="pet.imageUrl" 
                :alt="pet.name"
                class="pet-image"
              >
              <div v-else class="no-image">
                <span class="emoji">{{ getEmojiForSpecies(pet.species) }}</span>
              </div>
              <div class="image-actions">
                <label for="image-upload" class="upload-btn">📷 Changer</label>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageUpload"
                  style="display: none"
                >
                <button v-if="pet.imageUrl" @click="handleImageDelete" class="delete-img-btn">
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="pet-info">
              <h1>{{ pet.name }}</h1>
              <p class="species">{{ getSpeciesLabel(pet.species) }}</p>
              <p class="inclination">{{ getInclinationLabel(pet.inclination) }}</p>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="stats-section">
            <h2>📊 Statistiques</h2>
            <div class="stats-grid">
              <div class="stat-card health">
                <span class="stat-icon">❤️</span>
                <div class="stat-info">
                  <span class="stat-label">Santé</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pet.health + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ pet.health }}%</span>
                </div>
              </div>
              
              <div class="stat-card happiness">
                <span class="stat-icon">😊</span>
                <div class="stat-info">
                  <span class="stat-label">Bonheur</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pet.happiness + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ pet.happiness }}%</span>
                </div>
              </div>
              
              <div class="stat-card hunger">
                <span class="stat-icon">🍔</span>
                <div class="stat-info">
                  <span class="stat-label">Faim</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: pet.hunger + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ pet.hunger }}%</span>
                </div>
              </div>
              
              <div class="stat-card weight">
                <span class="stat-icon">⚖️</span>
                <div class="stat-info">
                  <span class="stat-label">Poids</span>
                  <span class="stat-value">{{ pet.weight }} kg</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="actions-section">
            <h2>🎮 Actions</h2>
            <div class="actions-grid">
              <button @click="handleFeed" class="action-btn feed" :disabled="actionLoading">
                🍔 Nourrir
              </button>
              <button @click="handlePlay" class="action-btn play" :disabled="actionLoading">
                🎮 Jouer
              </button>
              <button @click="handleToilet" class="action-btn toilet" :disabled="actionLoading">
                🚽 Toilettes
              </button>
              <button @click="handleSleep" class="action-btn sleep" :disabled="actionLoading">
                😴 Dormir
              </button>
            </div>
          </div>
          
          <!-- Delete -->
          <div class="danger-zone">
            <button @click="confirmDelete" class="delete-btn">
              🗑️ Supprimer ce Tamagotchi
            </button>
          </div>
        </div>
        
        <!-- Mode Édition -->
        <div v-else class="edit-mode">
          <form @submit.prevent="handleSave">
            <div class="form-group">
              <label for="name">Nom :</label>
              <input 
                id="name" 
                v-model="editForm.name" 
                type="text" 
                required
                placeholder="Nom du Tamagotchi"
              >
            </div>
            
            <div class="form-group">
              <label for="species">Espèce :</label>
              <select id="species" v-model="editForm.species" required>
                <option value="cat">🐱 Chat</option>
                <option value="dog">🐶 Chien</option>
                <option value="bird">🐦 Oiseau</option>
                <option value="dragon">🐉 Dragon</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="inclination">Inclination :</label>
              <select id="inclination" v-model="editForm.inclination" required>
                <option value="aggressive">⚔️ Agressif</option>
                <option value="neutral">😐 Neutre</option>
                <option value="friendly">😊 Amical</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" :disabled="actionLoading" class="save-btn">
                💾 Sauvegarder
              </button>
              <button type="button" @click="cancelEdit" class="cancel-btn">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePetsStore } from '@/store/pets';
import Header from '@/components/Header.vue';

const route = useRoute();
const router = useRouter();
const petsStore = usePetsStore();

// State
const pet = ref(null);
const isEditing = ref(false);
const actionLoading = ref(false);
const editForm = ref({
  name: '',
  species: '',
  inclination: ''
});

// Computed
const isLoading = computed(() => petsStore.isLoading);
const error = computed(() => petsStore.error);

// Charger le pet
async function loadPet() {
  try {
    const petId = route.params.id;
    pet.value = await petsStore.fetchPet(petId);
  } catch (err) {
    console.error('Erreur chargement pet:', err);
  }
}

// Navigation
function goBack() {
  router.push('/tamagotchis');
}

// Edition
function startEdit() {
  editForm.value = {
    name: pet.value.name,
    species: pet.value.species,
    inclination: pet.value.inclination
  };
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

async function handleSave() {
  actionLoading.value = true;
  try {
    await petsStore.updatePet(pet.value._id || pet.value.id, editForm.value);
    await loadPet();
    isEditing.value = false;
  } catch (err) {
    alert(err.message || 'Erreur lors de la sauvegarde');
  } finally {
    actionLoading.value = false;
  }
}

// Actions
async function handleFeed() {
  actionLoading.value = true;
  try {
    await petsStore.feedPet(pet.value._id || pet.value.id);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur');
  } finally {
    actionLoading.value = false;
  }
}

async function handlePlay() {
  actionLoading.value = true;
  try {
    await petsStore.playWithPet(pet.value._id || pet.value.id);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur');
  } finally {
    actionLoading.value = false;
  }
}

async function handleToilet() {
  actionLoading.value = true;
  try {
    await petsStore.toiletPet(pet.value._id || pet.value.id);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur');
  } finally {
    actionLoading.value = false;
  }
}

async function handleSleep() {
  actionLoading.value = true;
  try {
    await petsStore.sleepPet(pet.value._id || pet.value.id);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur');
  } finally {
    actionLoading.value = false;
  }
}

// Image
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  actionLoading.value = true;
  try {
    await petsStore.uploadPetImage(pet.value._id || pet.value.id, file);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur upload');
  } finally {
    actionLoading.value = false;
  }
}

async function handleImageDelete() {
  if (!confirm('Supprimer l\'image ?')) return;
  
  actionLoading.value = true;
  try {
    await petsStore.deletePetImage(pet.value._id || pet.value.id);
    await loadPet();
  } catch (err) {
    alert(err.message || 'Erreur suppression');
  } finally {
    actionLoading.value = false;
  }
}

// Delete
async function confirmDelete() {
  if (!confirm(`Supprimer ${pet.value.name} définitivement ?`)) return;
  
  try {
    await petsStore.deletePet(pet.value._id || pet.value.id);
    router.push('/tamagotchis');
  } catch (err) {
    alert(err.message || 'Erreur suppression');
  }
}

// Helpers
function getSpeciesLabel(species) {
  const labels = {
    cat: '🐱 Chat',
    dog: '🐶 Chien',
    bird: '🐦 Oiseau',
    dragon: '🐉 Dragon'
  };
  return labels[species] || species;
}

function getInclinationLabel(inclination) {
  const labels = {
    aggressive: '⚔️ Agressif',
    neutral: '😐 Neutre',
    friendly: '😊 Amical'
  };
  return labels[inclination] || inclination;
}

function getEmojiForSpecies(species) {
  const emojis = {
    cat: '🐱',
    dog: '🐶',
    bird: '🐦',
    dragon: '🐉'
  };
  return emojis[species] || '🐣';
}

// Lifecycle
onMounted(() => {
  loadPet();
});
</script>

<style scoped>
.tamagotchi-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading & Error */
.loading {
  text-align: center;
  color: white;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.error-container button {
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

/* Pet Detail */
.pet-detail {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-btn, .edit-btn, .cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn {
  background: #e2e8f0;
  color: #334155;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.cancel-btn {
  background: #94a3b8;
  color: white;
}

.back-btn:hover, .edit-btn:hover, .cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Pet Header */
.pet-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: center;
}

.pet-image-container {
  position: relative;
  flex-shrink: 0;
}

.pet-image, .no-image {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.no-image .emoji {
  font-size: 5rem;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.upload-btn, .delete-img-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.upload-btn {
  background: #667eea;
  color: white;
  display: inline-block;
}

.delete-img-btn {
  background: #ef4444;
  color: white;
}

.pet-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.pet-info .species, .pet-info .inclination {
  font-size: 1.2rem;
  color: #64748b;
  margin: 0.25rem 0;
}

/* Stats */
.stats-section {
  margin-bottom: 3rem;
}

.stats-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8fafc;
  border-left: 4px solid;
}

.stat-card.health { border-color: #ef4444; }
.stat-card.happiness { border-color: #f59e0b; }
.stat-card.hunger { border-color: #10b981; }
.stat-card.weight { border-color: #6366f1; }

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.stat-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

/* Actions */
.actions-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.action-btn {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.feed { background: #10b981; }
.action-btn.play { background: #f59e0b; }
.action-btn.toilet { background: #6366f1; }
.action-btn.sleep { background: #8b5cf6; }

.action-btn:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

/* Danger Zone */
.danger-zone {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #fee2e2;
}

.delete-btn {
  width: 100%;
  padding: 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #dc2626;
}

/* Edit Mode */
.edit-mode form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #334155;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn {
  flex: 1;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .pet-header {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>