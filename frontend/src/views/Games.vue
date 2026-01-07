<template>
  <div :class="$style.gamesPage">
    <!-- Background -->
    <img :class="$style.background" src="/background/background.svg" alt="background" />
    
    <!-- Header -->
    <div :class="$style.header">
      <button :class="$style.backButton" @click="goBack">
        ← Back
      </button>
      <h1 :class="$style.title">Games Arcade</h1>
      <p :class="$style.subtitle">Choose a game to play with your Tamagotchi!</p>
    </div>
    
    <!-- Current Pet Info -->
    <div v-if="currentPet" :class="$style.petInfo">
      <div :class="$style.petAvatar">
        <img v-if="currentPet.image" :src="currentPet.image" alt="Pet" />
        <span v-else>🐾</span>
      </div>
      <div :class="$style.petDetails">
        <h3 :class="$style.petName">{{ currentPet.name }}</h3>
        <div :class="$style.petStats">
          <div :class="$style.petStat">
            <span>⚡</span>
            <span :class="$style[getStatColorClass(currentPet.energy)]">{{ currentPet.energy }}/100</span>
          </div>
          <div :class="$style.petStat">
            <span>😄</span>
            <span :class="$style[getStatColorClass(currentPet.fun)]">{{ currentPet.fun }}/100</span>
          </div>
          <div :class="$style.petStat">
            <span>🍎</span>
            <span :class="$style[getStatColorClass(currentPet.hunger)]">{{ currentPet.hunger }}/100</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" :class="$style.loading">
      <div :class="$style.spinner"></div>
      <p>Loading games...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" :class="$style.error">
      <p>❌ {{ error }}</p>
      <button :class="$style.retryButton" @click="loadGames">Retry</button>
    </div>
    
    <!-- Games Grid -->
    <div v-else :class="$style.gamesGrid">
      <GameCard 
        v-for="game in games" 
        :key="game.id" 
        :game="game"
        @play="handlePlayGame"
        @select="handleSelectGame"
      />
    </div>
    
    <!-- No pet warning -->
    <div v-if="!currentPet && !loading" :class="$style.noPetWarning">
      <p>⚠️ You need a Tamagotchi to play games!</p>
      <button :class="$style.createPetButton" @click="goToCreatePet">
        Create a Tamagotchi
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGamesStore } from '../store/games';
import { usePetsStore } from '../store/pets';
import GameCard from '../components/GameCard.vue';

const router = useRouter();
const gamesStore = useGamesStore();
const petsStore = usePetsStore();

const games = computed(() => gamesStore.games);
const loading = computed(() => gamesStore.loading || petsStore.loading);
const error = computed(() => gamesStore.error);
const currentPet = computed(() => petsStore.currentPet || (petsStore.petsList.length > 0 ? petsStore.petsList[0] : null));

// Load games and current pet
const loadGames = async () => {
  try {
    await gamesStore.fetchGames();
  } catch (err) {
    console.error('Error loading games:', err);
  }
};

const loadCurrentPet = async () => {
  try {
    if (!petsStore.currentPet && petsStore.petsList.length === 0) {
      await petsStore.fetchPets({ limit: 1 });
    }
  } catch (err) {
    console.error('Error loading pet:', err);
  }
};

// Handle game selection
const handleSelectGame = (game) => {
  console.log('Game selected:', game);
  // Pour l'instant, on ne fait rien de spécial
  // Plus tard, on pourra afficher des détails du jeu
};

// Handle play game
const handlePlayGame = async (game) => {
  if (!currentPet.value) {
    alert('You need a Tamagotchi to play!');
    return;
  }
  
  // Vérifier si le pet a assez d'énergie
  if (currentPet.value.energy < game.energyCost) {
    alert(`Not enough energy! Your Tamagotchi needs at least ${game.energyCost} energy to play this game.`);
    return;
  }
  
  try {
    console.log('Playing game:', game.name, 'with pet:', currentPet.value.name);
    
    // Jouer au jeu (pour l'instant avec un score aléatoire)
    const randomScore = Math.floor(Math.random() * 100);
    await gamesStore.playGame(currentPet.value._id, game.id, randomScore);
    
    // Recharger les stats du pet
    await petsStore.fetchPet(currentPet.value._id);
    
    alert(`🎉 Great! Your Tamagotchi had fun playing ${game.name}!\nScore: ${randomScore}`);
  } catch (err) {
    console.error('Error playing game:', err);
  }
};

// Navigation
const goBack = () => {
  router.push('/tamago');
};

const goToCreatePet = () => {
  router.push('/tamagotchi');
};

// Get stat color class based on value
const getStatColorClass = (value) => {
  if (value >= 75) return 'statGood';
  if (value >= 35) return 'statMedium';
  return 'statLow';
};

onMounted(() => {
  loadGames();
  loadCurrentPet();
});
</script>

<style module>
.gamesPage {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: #c0fe90;
  padding: 20px;
  font-family: 'Pixelify Sans', sans-serif;
  overflow-y: auto;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 30px;
}

.backButton {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 20px;
  background-color: #fff;
  border: 3px solid #000;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', sans-serif;
}

.backButton:hover {
  background-color: #ffd93d;
  transform: translateY(-2px);
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: #000;
  margin: 0;
  text-shadow: 3px 3px 0 rgba(255, 255, 255, 0.5);
}

.subtitle {
  font-size: 18px;
  color: #333;
  margin: 8px 0 0;
}

.petInfo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 3px solid #000;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.petAvatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #6bcf7f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border: 3px solid #000;
  overflow: hidden;
}

.petAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.petDetails {
  flex: 1;
}

.petName {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #000;
}

.petStats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.petStat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  font-weight: 700;
}

.petStat span:first-child {
  font-size: 20px;
}

.statGood {
  color: #6bcf7f;
}

.statMedium {
  color: #ffd93d;
}

.statLow {
  color: #ff6b6b;
}

.loading {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-top-color: #6bcf7f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(255, 107, 107, 0.2);
  border-radius: 16px;
  border: 3px solid #ff6b6b;
  max-width: 500px;
  margin: 0 auto;
}

.error p {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px;
}

.retryButton {
  padding: 12px 32px;
  background-color: #6bcf7f;
  border: 3px solid #000;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', sans-serif;
}

.retryButton:hover {
  background-color: #5ab86e;
  transform: translateY(-2px);
}

.gamesGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 20px 0;
  max-width: 1200px;
  margin: 0 auto;
}

.noPetWarning {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
  background-color: rgba(255, 217, 61, 0.3);
  border-radius: 16px;
  border: 3px solid #ffd93d;
  max-width: 500px;
  margin: 40px auto;
}

.noPetWarning p {
  font-size: 18px;
  font-weight: 700;
  color: #000;
  margin: 0 0 16px;
}

.createPetButton {
  padding: 12px 32px;
  background-color: #6bcf7f;
  border: 3px solid #000;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', sans-serif;
}

.createPetButton:hover {
  background-color: #5ab86e;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .title {
    font-size: 32px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .gamesGrid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .petInfo {
    flex-direction: column;
    text-align: center;
  }
}
</style>
