<template>
  <div class="dashboard-page">
    <div class="dashboard-card">
      <h1 class="greeting">Hello {{ authStore.user?.name }} !</h1>
      <p class="subtitle">Glad to see you back</p>
      
      <div class="actions">
        <button 
          v-if="hasPets" 
          class="btn-continue" 
          @click="continueGame"
        >
          Continue
        </button>
        <button class="btn-new-game" @click="startNewGame">
          Start new game
        </button>
      </div>

      <p class="comeback">Come back soon !</p>
      
      <button class="btn-logout" @click="logout">
        Log out
      </button>
    </div>

    <!-- Modal de confirmation suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-container">
        <div class="modal-content">
        <h2 class="modal-title">
          <img src="/icons/TriangleWarningIcon.svg" class="title-warning-icon" alt="warning">
          Delete Current Pet?
        </h2>
          <p class="modal-warning">
            Starting a new game will permanently delete your current Tamagotchi!
          </p>

          <div class="modal-buttons">
            <button 
              class="btn-cancel"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>
            <button 
              class="btn-confirm"
              @click="confirmDelete"
            >
              Delete & Start New
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/index';
import { usePetsStore } from '@/store/pets';

const router = useRouter();
const authStore = useAuthStore();
const petsStore = usePetsStore();

const showDeleteModal = ref(false);

const hasPets = computed(() => {
  return petsStore.petsList && petsStore.petsList.length > 0;
});

onMounted(async () => {
  // Charger les pets de l'utilisateur pour savoir s'il peut continuer
  if (authStore.user?.id) {
    try {
      console.log('[Dashboard] Loading pets for user:', authStore.user.id);
      await petsStore.fetchPets({ userId: authStore.user.id, limit: 10 });
      console.log('[Dashboard] Pets loaded:', petsStore.petsList);
      console.log('[Dashboard] Has pets:', hasPets.value);
    } catch (err) {
      console.error('Erreur lors du chargement des pets:', err);
    }
  } else {
    console.error('[Dashboard] No user ID found');
  }
});

function continueGame() {
  // Rediriger vers /tamago pour continuer avec le pet existant
  router.push('/tamago');
}

async function startNewGame() {
  // Si l'utilisateur a déjà un pet, afficher la modal de confirmation
  if (hasPets.value) {
    showDeleteModal.value = true;
  } else {
    // Sinon, rediriger directement vers /tamago
    router.push('/tamago');
  }
}

async function confirmDelete() {
  try {
    const firstPet = petsStore.petsList[0];
    const petId = firstPet._id || firstPet.id;
    await petsStore.deletePet(petId);
    console.log('[Dashboard] Pet deleted, starting new game');
    
    // Nettoyer le localStorage pour ce pet
    localStorage.removeItem(`hatched_pet_image_${petId}`);
    
    // Fermer la modal et rediriger
    showDeleteModal.value = false;
    router.push('/tamago');
  } catch (err) {
    console.error('Erreur lors de la suppression du pet:', err);
    alert('Erreur lors de la suppression du Tamagotchi');
  }
}

async function logout() {
  await authStore.logout();
  await router.push('/login');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.dashboard-page {
  height: 100vh;
  height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 0 1rem;
  overflow: hidden;
  box-sizing: border-box;
}

.dashboard-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.greeting {
  font-family: 'Pixelify Sans', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.25rem;
  font-weight: 400;
  color: #808080;
  margin: 0 0 3rem 0;
  line-height: 1.2;
}

.actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-continue,
.btn-new-game {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  background: #627DE0;
  color: #ffffff;
}

.btn-continue:hover,
.btn-new-game:hover {
  background: #5169c7;
}

.btn-continue:active,
.btn-new-game:active {
  transform: scale(0.98);
}

.comeback {
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 1.5rem 0;
}

.btn-logout {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  background: #E06264;
  color: #ffffff;
}

.btn-logout:hover {
  background: #c74f51;
}

.btn-logout:active {
  transform: scale(0.98);
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
  max-width: 450px;
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
  padding: 2rem;
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
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.25rem;
}

.title-warning-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.modal-warning {
  margin: 0 0 2rem;
  font-size: 1rem;
  color: #D5230C;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}

.warning-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: 4px solid #000000;
  border-radius: 16px;
  cursor: pointer;
  font-family: 'Pixelify Sans', monospace;
  transition: all 0.2s;
}

.btn-cancel {
  background: #e0e0e0;
  color: #000000;
}

.btn-cancel:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
}

.btn-confirm {
  background: #E06264;
  color: #ffffff;
}

.btn-confirm:hover {
  background: #c74f51;
  transform: translateY(-2px);
}

.btn-cancel:active,
.btn-confirm:active {
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .greeting {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .dashboard-card {
    max-width: 100%;
  }
}
</style>
