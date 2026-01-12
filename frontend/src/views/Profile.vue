<template>
  <div class="page profile-page">
    <div class="profile-container">
      <!-- Header avec retour -->
      <div class="header">
        <button class="btn-back" @click="goBack">
          <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" class="back-icon" />
        </button>
        <h2 class="title">Profile</h2>
      </div>

      <!-- Carte du profil -->
      <div class="profile-card">
        <!-- Avatar et Pet -->
        <div class="pet-section">
          <div class="pet-avatar">
            <img 
              v-if="petImage" 
              :src="petImage" 
              alt="Your Pet" 
              class="pet-image"
            />
            <div v-else class="pet-placeholder">🥚</div>
          </div>
          <div class="pet-info">
            <div class="pet-name-container">
              <h3 class="pet-name">{{ currentPet?.name || 'No Pet' }}</h3>
              <button 
                v-if="currentPet" 
                @click="showRenameModal = true" 
                class="btn-edit"
                title="Rename your pet"
              >
                <img src="/icons/EditProfileIcon.svg?v=2" alt="Edit" class="edit-icon" />
              </button>
            </div>
          </div>
        </div>

        <!-- Informations utilisateur -->
        <div class="user-section">
          <h3 class="section-title">Account Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Username:</span>
              <span class="info-value">{{ user?.name || 'N/A' }}</span>
            </div>
            <div v-if="user?.email" class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
          </div>
        </div>

        <!-- Statistiques du pet -->
        <div v-if="petStats" class="stats-section">
          <h3 class="section-title">Pet Statistics</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <img src="/icons/health-stool--Streamline-Pixel.svg" alt="Poops" class="stat-icon-img" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ petStats.poopsCount || 0 }}</div>
                <div class="stat-label">Poops</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <img src="/icons/entertainment-events-hobbies-game-machines-arcade-1--Streamline-Pixel.svg" alt="Games" class="stat-icon-img" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ petStats.gamesCount || 0 }}</div>
                <div class="stat-label">Games</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de renommage du pet -->
    <div v-if="showRenameModal" class="modal-overlay" @click.self="showRenameModal = false">
      <div class="modal-container">
        <div class="modal-content">
          <h2 class="modal-title">Rename your pet</h2>
          
          <p v-if="renameError" class="field-error">
            <img src="/icons/WarningIcon.svg" class="error-icon" alt="warning"> {{ renameError }}
          </p>
          <p v-else class="field-hint">
            <img src="/icons/WarningIcon.svg" class="error-icon" alt="warning"> 3-20 caractères, lettres uniquement
          </p>

          <form @submit.prevent="handleRename" class="form">
            <div class="form-field">
              <input
                v-model.trim="newPetName"
                type="text"
                :placeholder="currentPet?.name || 'Enter new name...'"
                autocomplete="off"
                :class="{ 'input-error': renameError }"
                :disabled="renamingPet"
                @input="validateRename"
                ref="renameInput"
                maxlength="20"
              />
            </div>

            <div class="modal-buttons">
              <button 
                type="button"
                @click="showRenameModal = false"
                class="btn-cancel"
                :disabled="renamingPet"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="renamingPet || !isRenameValid" 
                class="btn-submit"
                :class="{ 'btn-disabled': !isRenameValid }"
              >
                {{ renamingPet ? "Saving..." : "Save" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/index'
import { usePetsStore } from '@/store/pets'

const authStore = useAuthStore()
const petsStore = usePetsStore()
const user = ref(null)
const petStats = ref(null)
const petImage = ref(null)
const router = useRouter()

// Rename modal state
const showRenameModal = ref(false)
const newPetName = ref('')
const renamingPet = ref(false)
const renameError = ref('')
const renameInput = ref(null)

// Get current pet
const currentPet = computed(() => petsStore.currentPet)

// Validation du nouveau nom
const isRenameValid = computed(() => {
  const name = newPetName.value.trim()
  if (name.length < 3 || name.length > 20) return false
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(name)
})

function validateRename() {
  renameError.value = ''
  const name = newPetName.value.trim()
  
  if (name.length === 0) {
    renameError.value = 'Le nom est obligatoire'
    return
  }
  
  if (name.length < 3) {
    renameError.value = 'Minimum 3 caractères'
    return
  }
  
  if (name.length > 20) {
    renameError.value = 'Maximum 20 caractères'
    return
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    renameError.value = 'Lettres uniquement (pas de chiffres ou caractères spéciaux)'
    return
  }
}

async function handleRename() {
  validateRename()
  
  if (!isRenameValid.value || !currentPet.value) return
  
  renamingPet.value = true
  
  try {
    const petId = currentPet.value._id || currentPet.value.id
    await petsStore.updatePet(petId, { name: newPetName.value.trim() })
    
    // Rafraîchir le pet
    await petsStore.fetchPet(petId)
    
    // Fermer le modal
    showRenameModal.value = false
    newPetName.value = ''
    renameError.value = ''
  } catch (error) {
    renameError.value = 'Erreur lors du renommage'
    console.error('Error renaming pet:', error)
  } finally {
    renamingPet.value = false
  }
}

function goBack() {
  router.push('/tamago')
}

// Focus sur l'input quand le modal s'ouvre
watch(showRenameModal, async (newVal) => {
  if (newVal) {
    newPetName.value = currentPet.value?.name || ''
    await nextTick()
    if (renameInput.value) {
      renameInput.value.focus()
    }
  } else {
    newPetName.value = ''
    renameError.value = ''
  }
})

onMounted(async () => {
  try {
    // Charger l'utilisateur connecté
    user.value = authStore.currentUser;
    if (!user.value) {
      console.log('[Profile] No user in store, checking auth...');
      await authStore.checkAuth();
      user.value = authStore.currentUser;
    }
    console.log('[Profile] User loaded:', user.value?.name);
    
    // Si pas de pet chargé dans le store, récupérer le premier pet de l'utilisateur
    if (!currentPet.value) {
      console.log('[Profile] No current pet, fetching pets...');
      await petsStore.fetchPets();
      
      // Si on a des pets, charger le premier
      if (petsStore.pets.length > 0) {
        const firstPet = petsStore.pets[0];
        const petId = firstPet._id || firstPet.id;
        await petsStore.fetchPet(petId);
        console.log('[Profile] Loaded pet:', currentPet.value?.name, petId);
      }
    }
    
    // Load pet stats
    if (currentPet.value) {
      const petId = currentPet.value._id || currentPet.value.id;
      console.log('[Profile] Fetching stats for pet:', petId);
      
      // Charger l'image du pet depuis la BDD
      petImage.value = currentPet.value.imageUrl || null;
      console.log('[Profile] Pet image from database:', petImage.value);
      
      // Charger les stats du pet
      petStats.value = await petsStore.fetchPetStats(petId);
      console.log('[Profile] Loaded pet stats:', petStats.value);
    } else {
      console.log('[Profile] No pet found to load stats');
    }
  } catch (error) {
    console.error('[Profile] Error loading pet data:', error);
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.profile-page {
  width: 100%;
  height: 100vh;
  height: 100svh;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #c0fe90 0%, #a8e678 100%);
  padding: 2rem 1rem 3rem;
  font-family: 'Pixelify Sans', monospace;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  box-sizing: border-box;
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-back {
  position: absolute;
  left: 0;
  padding: 0.5rem;
  background: #ffffff;
  color: #000000;
  border: 4px solid #000000;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
}

.btn-back:hover {
  transform: scale(1.05);
}

.btn-back:active {
  transform: scale(0.98);
}

.back-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.title {
  font-family: 'Pixelify Sans', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #000000;
  text-shadow: 3px 3px 0 rgba(255, 255, 255, 0.5);
}

.profile-card {
  background: #ffffff;
  border: 5px solid #000000;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

/* Pet Section */
.pet-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 4px solid #000000;
  margin-bottom: 2rem;
}

.pet-avatar {
  width: 200px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pet-placeholder {
  font-size: 6rem;
}

.pet-info {
  text-align: center;
  width: 100%;
}

.pet-name-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.pet-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #000000;
}

.btn-edit {
  position: absolute;
  right: 20px;
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.btn-edit:hover {
  transform: scale(1.15);
}

.btn-edit:active {
  transform: scale(0.9);
}

.edit-icon {
  width: 25px;
  height: 32px;
  object-fit: contain;
}

/* User Section */
.user-section {
  padding-bottom: 2rem;
  border-bottom: 4px solid #000000;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: #000000;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f8f8;
  border: 3px solid #000000;
  border-radius: 12px;
}

.info-label {
  font-weight: 700;
  color: #000000;
}

.info-value {
  color: #333333;
}

/* Stats Section */
.stats-section {
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  border: 4px solid #000000;
  border-radius: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.stat-icon-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #000000;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #666666;
  margin-top: 0.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  width: 90%;
  max-width: 420px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  padding: 2rem 2rem 2.5rem;
  border: 5px solid #000000;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 1.5rem;
  line-height: 1.4;
}

.field-error {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #D5230C;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.field-hint {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #D5230C;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  text-align: center;
}

.form-field input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 4px solid #000000;
  border-radius: 16px;
  outline: none;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', monospace;
  box-sizing: border-box;
  background: #e8e8e8;
  color: #000000;
  text-align: center;
  font-weight: 500;
}

.form-field input::placeholder {
  color: #999999;
  font-style: normal;
}

.form-field input:focus {
  border-color: #000000;
  background: #f5f5f5;
  transform: scale(1.02);
}

.form-field input.input-error {
  border-color: #D5230C;
  background: #ffe6e6;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  border: 4px solid #000000;
  border-radius: 16px;
  cursor: pointer;
  font-family: 'Pixelify Sans', monospace;
  text-transform: capitalize;
}

.btn-cancel {
  background: #e0e0e0;
  color: #000000;
}

.btn-cancel:hover:not(:disabled) {
  background: #d0d0d0;
}

.btn-submit {
  background: #ffb84d;
  color: #ffffff;
}

.btn-submit:hover:not(:disabled) {
  background: #ff9500;
}

.btn-submit:disabled,
.btn-submit.btn-disabled {
  background: #cccccc;
  border-color: #999999;
  color: #666666;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .profile-card {
    padding: 1.5rem;
  }

  .pet-avatar {
    width: 200px;
    height: 150px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .modal-buttons {
    flex-direction: column;
  }
}
</style>