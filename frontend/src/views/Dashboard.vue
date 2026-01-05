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
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/index';
import { usePetsStore } from '@/store/pets';

const router = useRouter();
const authStore = useAuthStore();
const petsStore = usePetsStore();

const hasPets = computed(() => {
  return petsStore.petsList && petsStore.petsList.length > 0;
});

onMounted(async () => {
  // Charger les pets de l'utilisateur pour savoir s'il peut continuer
  if (authStore.user?.id) {
    try {
      await petsStore.fetchPets({ userId: authStore.user.id });
    } catch (err) {
      console.error('Erreur lors du chargement des pets:', err);
    }
  }
});

function continueGame() {
  // Rediriger vers le premier pet
  if (petsStore.petsList && petsStore.petsList.length > 0) {
    const firstPet = petsStore.petsList[0];
    const petId = firstPet._id || firstPet.id;
    router.push(`/tamagotchi/${petId}`);
  }
}

function startNewGame() {
  // Rediriger vers la liste des tamagotchis pour en créer un nouveau
  router.push('/tamagotchis');
}

function logout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.dashboard-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 2rem 1rem;
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
  background: #3b82f6;
  color: #ffffff;
}

.btn-continue:hover,
.btn-new-game:hover {
  background: #2563eb;
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
  background: #ef4444;
  color: #ffffff;
}

.btn-logout:hover {
  background: #dc2626;
}

.btn-logout:active {
  transform: scale(0.98);
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
