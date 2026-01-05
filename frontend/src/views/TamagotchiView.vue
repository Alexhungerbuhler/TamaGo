<template>
  <div class="tamagotchi-view">
    <!-- Background pixelisé -->
    <div class="background">
      <div class="sky"></div>
      <div class="hills"></div>
    </div>

    <!-- Contenu principal -->
    <div class="content" v-if="!isLoading">
      <!-- Barres de statut en haut -->
      <div class="status-bars">
        <div class="status-circle hunger">
          <div class="status-icon-wrapper">
            <svg class="status-icon" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="10" width="16" height="12" stroke="#000" stroke-width="2" fill="none"/>
              <rect x="10" y="12" width="12" height="8" fill="#000"/>
            </svg>
          </div>
          <div class="status-bar">
            <div class="status-fill green" :style="{ width: (pet?.hunger || 75) + '%' }"></div>
          </div>
          <span class="status-label">Hunger</span>
        </div>

        <div class="status-circle hygiene">
          <div class="status-icon-wrapper">
            <svg class="status-icon" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="8" stroke="#000" stroke-width="2" fill="none"/>
              <path d="M12 20 Q16 24 20 20" stroke="#000" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="status-bar">
            <div class="status-fill green" :style="{ width: (pet?.hygiene || 75) + '%' }"></div>
          </div>
          <span class="status-label">Hygiene</span>
        </div>

        <div class="status-circle fun">
          <div class="status-icon-wrapper">
            <svg class="status-icon" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="10" stroke="#000" stroke-width="2" fill="none"/>
              <circle cx="12" cy="14" r="2" fill="#000"/>
              <circle cx="20" cy="14" r="2" fill="#000"/>
              <path d="M12 20 Q16 24 20 20" stroke="#000" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="status-bar">
            <div class="status-fill red" :style="{ width: (pet?.fun || 75) + '%' }"></div>
          </div>
          <span class="status-label">Fun</span>
        </div>

        <div class="status-circle energy">
          <div class="status-icon-wrapper">
            <svg class="status-icon" viewBox="0 0 32 32" fill="none">
              <rect x="8" y="10" width="16" height="12" stroke="#000" stroke-width="2" fill="none"/>
              <rect x="24" y="14" width="2" height="4" fill="#000"/>
              <rect x="10" y="12" width="12" height="8" fill="#000"/>
            </svg>
          </div>
          <div class="status-bar">
            <div class="status-fill orange" :style="{ width: (pet?.energy || 75) + '%' }"></div>
          </div>
          <span class="status-label">Energy</span>
        </div>
      </div>

      <!-- Texte de bienvenue -->
      <div class="welcome-section">
        <h1 class="welcome-title">Bienvenue "{{ pet?.name || 'MonTamaGO' }}"</h1>
        <p class="shake-instruction">Shake your phone to hatch the egg</p>
      </div>

      <!-- Animation téléphone -->
      <div class="phone-animation">
        <div class="phone phone-left"></div>
        <div class="phone phone-center">
          <div class="phone-screen"></div>
        </div>
        <div class="phone phone-right"></div>
        <div class="shake-arrow">⇄</div>
      </div>

      <!-- Œuf -->
      <div class="egg-container">
        <div class="egg">
          <div class="egg-pattern"></div>
        </div>
      </div>

      <!-- Navigation en bas -->
      <div class="bottom-nav">
        <div class="nav-item" @click="goToProfile">
          <svg class="nav-icon" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="6" stroke="#000" stroke-width="2" fill="none"/>
            <path d="M8 28c0-4 3.5-8 8-8s8 4 8 8" stroke="#000" stroke-width="2" fill="none"/>
          </svg>
          <span class="nav-label">Profile</span>
        </div>
        <div class="nav-item" @click="goToMap">
          <svg class="nav-icon" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="#000" stroke-width="2" fill="none"/>
            <line x1="16" y1="2" x2="16" y2="30" stroke="#000" stroke-width="2"/>
            <line x1="2" y1="16" x2="30" y2="16" stroke="#000" stroke-width="2"/>
          </svg>
          <span class="nav-label">Map</span>
        </div>
        <div class="nav-item" @click="goTo1v1">
          <svg class="nav-icon" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#000" stroke-width="2" fill="none"/>
            <circle cx="16" cy="16" r="4" fill="#000"/>
            <circle cx="16" cy="16" r="8" stroke="#000" stroke-width="1" fill="none"/>
          </svg>
          <span class="nav-label">1v1</span>
        </div>
        <div class="nav-item" @click="goToGames">
          <svg class="nav-icon" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" stroke="#000" stroke-width="2" fill="none"/>
            <rect x="12" y="12" width="8" height="8" fill="#000"/>
            <circle cx="10" cy="10" r="2" fill="#000"/>
            <circle cx="22" cy="10" r="2" fill="#000"/>
            <circle cx="10" cy="22" r="2" fill="#000"/>
            <circle cx="22" cy="22" r="2" fill="#000"/>
          </svg>
          <span class="nav-label">Games</span>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="action-buttons">
        <button class="action-btn left-arrow" @click="previousAction">←</button>
        <button class="action-btn use-btn" @click="useAction">USE</button>
        <button class="action-btn right-arrow" @click="nextAction">→</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-text">Chargement...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePetsStore } from '../store/pets';
import { useAuthStore } from '../store';

const router = useRouter();
const route = useRoute();
const petsStore = usePetsStore();
const authStore = useAuthStore();

const pet = ref(null);
const isLoading = ref(true);

// Récupérer le pet depuis l'URL ou le premier pet de l'utilisateur
async function loadPet() {
  isLoading.value = true;
  try {
    const petId = route.params.id;
    
    if (petId) {
      // Charger le pet spécifique
      pet.value = await petsStore.fetchPet(petId);
    } else {
      // Charger le premier pet de l'utilisateur
      await petsStore.fetchPets({ userId: authStore.currentUser?.id });
      if (petsStore.petsList.length > 0) {
        pet.value = petsStore.petsList[0];
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement du pet:', err);
  } finally {
    isLoading.value = false;
  }
}

function goToProfile() {
  router.push('/profile');
}

function goToMap() {
  router.push('/map');
}

function goTo1v1() {
  // TODO: Implémenter la page 1v1
  console.log('1v1');
}

function goToGames() {
  // TODO: Implémenter la page Games
  console.log('Games');
}

function previousAction() {
  // TODO: Action précédente
  console.log('Previous');
}

function useAction() {
  // TODO: Action USE
  console.log('Use');
}

function nextAction() {
  // TODO: Action suivante
  console.log('Next');
}

onMounted(() => {
  loadPet();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.tamagotchi-view {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Pixelify Sans', monospace;
}

/* Background pixelisé */
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(180deg, #87CEEB 0%, #B0E0E6 100%);
}

.sky::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 10%;
  width: 60px;
  height: 30px;
  background: #fff;
  border-radius: 50px;
  opacity: 0.9;
  box-shadow: 100px 20px 0 #fff, 200px 40px 0 #fff, 300px 10px 0 #fff;
}

.sky::after {
  content: '';
  position: absolute;
  top: 25%;
  left: 45%;
  width: 50px;
  height: 25px;
  background: #fff;
  border-radius: 50px;
  opacity: 0.9;
  box-shadow: 80px -15px 0 #fff;
}

.hills {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: linear-gradient(180deg, #90EE90 0%, #7CFC00 100%);
  clip-path: polygon(0 40%, 100% 30%, 100% 100%, 0% 100%);
}

.hills::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: -20%;
  width: 140%;
  height: 80%;
  background: #32CD32;
  clip-path: polygon(0 60%, 100% 50%, 100% 100%, 0% 100%);
}

/* Contenu */
.content {
  position: relative;
  z-index: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Barres de statut */
.status-bars {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem 0.5rem;
  margin-bottom: 1rem;
}

.status-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.status-icon-wrapper {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #000;
  border-radius: 50%;
  background: #fff;
}

.status-icon {
  width: 28px;
  height: 28px;
}

.status-bar {
  width: 50px;
  height: 8px;
  background: #e5e5e5;
  border: 2px solid #000;
  border-radius: 4px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.status-fill.green {
  background: #0AD03F;
}

.status-fill.red {
  background: #D00A0A;
}

.status-fill.orange {
  background: #D38600;
}

.status-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
}

/* Section bienvenue */
.welcome-section {
  text-align: center;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 0 #fff;
}

.shake-instruction {
  font-size: 0.9rem;
  font-weight: 400;
  color: #000;
  margin: 0;
}

/* Animation téléphone */
.phone-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  position: relative;
  height: 60px;
}

.phone {
  width: 30px;
  height: 50px;
  border: 3px solid #000;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.3);
  position: absolute;
}

.phone-center {
  background: #fff;
  z-index: 2;
  left: 50%;
  transform: translateX(-50%);
  animation: phoneShake 1s infinite;
}

.phone-left {
  left: calc(50% - 40px);
  transform: translateX(-50%) rotate(-8deg);
  opacity: 0.3;
  animation: phoneShakeLeft 1s infinite;
}

.phone-right {
  left: calc(50% + 40px);
  transform: translateX(-50%) rotate(8deg);
  opacity: 0.3;
  animation: phoneShakeRight 1s infinite;
}

.phone-screen {
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  margin: 2px;
  background: #000;
  border-radius: 2px;
}

.shake-arrow {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  animation: shake 1s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(-50%) translateX(0); }
  25% { transform: translateX(-50%) translateX(-5px); }
  75% { transform: translateX(-50%) translateX(5px); }
}

@keyframes phoneShake {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  25% { transform: translateX(-50%) rotate(-5deg); }
  75% { transform: translateX(-50%) rotate(5deg); }
}

@keyframes phoneShakeLeft {
  0%, 100% { transform: translateX(-50%) rotate(-8deg); }
  25% { transform: translateX(-50%) rotate(-12deg); }
  75% { transform: translateX(-50%) rotate(-4deg); }
}

@keyframes phoneShakeRight {
  0%, 100% { transform: translateX(-50%) rotate(8deg); }
  25% { transform: translateX(-50%) rotate(4deg); }
  75% { transform: translateX(-50%) rotate(12deg); }
}

/* Œuf */
.egg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
  flex: 1;
}

.egg {
  width: 150px;
  height: 200px;
  background: #B0E0E6;
  border: 4px solid #000;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  image-rendering: pixelated;
}

.egg-pattern {
  position: absolute;
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  background: 
    radial-gradient(circle at 20% 30%, #87CEEB 3px, transparent 3px),
    radial-gradient(circle at 60% 50%, #87CEEB 4px, transparent 4px),
    radial-gradient(circle at 40% 70%, #87CEEB 3px, transparent 3px),
    radial-gradient(circle at 75% 25%, #87CEEB 3px, transparent 3px);
  background-size: 20px 20px, 25px 25px, 18px 18px, 22px 22px;
  opacity: 0.7;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

/* Navigation en bas */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1rem 0.5rem;
  margin-bottom: 1rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
}

.nav-icon {
  width: 32px;
  height: 32px;
  stroke: #000;
  stroke-width: 2;
  fill: none;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: #fff;
  border: 3px solid #000;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.left-arrow,
.right-arrow {
  font-size: 1.5rem;
  padding: 0.5rem;
}

.use-btn {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  min-width: 100px;
}

/* Loading */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-text {
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
}

/* Mobile */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.25rem;
  }

  .shake-instruction {
    font-size: 0.8rem;
  }

  .egg {
    width: 120px;
    height: 160px;
  }

  .status-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .status-icon {
    width: 22px;
    height: 22px;
  }

  .status-bar {
    width: 40px;
  }

  .status-label {
    font-size: 0.6rem;
  }

  .nav-icon {
    width: 28px;
    height: 28px;
  }

  .action-btn {
    min-width: 50px;
    height: 45px;
    font-size: 0.9rem;
  }

  .use-btn {
    min-width: 80px;
  }
}
</style>

