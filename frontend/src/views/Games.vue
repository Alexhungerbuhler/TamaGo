<template>
  <div :class="$style.gamesPage">
    <!-- Background -->
    <img :class="$style.background" src="/background/background.svg" alt="background" />
    
    <!-- Header -->
    <div :class="$style.header">
      <button :class="$style.backButton" @click="goBack">
        <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" :class="$style.backIcon" />
      </button>
      <h1 :class="$style.title">Memory Game</h1>
      <p :class="$style.subtitle">Find all the Tamagotchi pairs!</p>
    </div>
    
    <!-- Game Stats -->
    <div :class="$style.gameStats">
      <div :class="$style.statBox">
        <span :class="$style.statLabel">Moves</span>
        <span :class="$style.statValue">{{ moves }}</span>
      </div>
      <div :class="$style.statBox">
        <span :class="$style.statLabel">Pairs Found</span>
        <span :class="$style.statValue">{{ pairsFound }}/6</span>
      </div>
      <button 
        v-if="gameWon" 
        :class="$style.playAgainButton" 
        @click="resetGame"
      >
        🎉 Play Again
      </button>
      <button 
        v-else 
        :class="$style.resetButton" 
        @click="resetGame"
      >
        🔄 Restart
      </button>
    </div>
    
    <!-- Memory Grid -->
    <div :class="$style.memoryGrid">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        :class="[
          $style.card,
          { 
            [$style.flipped]: card.flipped,
            [$style.matched]: card.matched,
            [$style.wrong]: card.wrong
          }
        ]"
        @click="handleCardClick(index)"
      >
        <div :class="$style.cardInner">
          <!-- Front (blue) -->
          <div :class="$style.cardFront"></div>
          <!-- Back (Tamagotchi image) -->
          <div :class="$style.cardBack">
            <img :src="card.image" :alt="card.name" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Win Message -->
    <div v-if="gameWon" :class="$style.winMessage">
      <h2>🎉 Congratulations! 🎉</h2>
      <p>You found all pairs in {{ moves }} moves!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePetsStore } from '../store/pets';

const router = useRouter();
const petsStore = usePetsStore();

// Pet actuel
const currentPet = computed(() => petsStore.currentPet || (petsStore.petsList.length > 0 ? petsStore.petsList[0] : null));

// Les 6 Tamagotchis pour grille 4x3
const tamagotchis = [
  { id: 1, name: 'Buisson', image: '/Pets/buisson 1.svg' },
  { id: 2, name: 'Chat Feu', image: '/Pets/chatFeu 1.svg' },
  { id: 3, name: 'Goutte', image: '/Pets/goute 1.svg' },
  { id: 4, name: 'Mystère', image: '/Pets/jspcestquoi 1.svg' },
  { id: 5, name: 'Raichu', image: '/Pets/raichu 1.svg' },
  { id: 6, name: 'Renard', image: '/Pets/renarddelumiere 1.svg' }
];

// État du jeu
const cards = ref([]);
const flippedCards = ref([]);
const moves = ref(0);
const pairsFound = ref(0);
const canFlip = ref(true);

const gameWon = computed(() => pairsFound.value === 6);

// Initialiser le jeu
const initGame = async () => {
  // Vérifier que le pet a assez d'énergie
  if (!currentPet.value) {
    alert('❌ You need a Tamagotchi to play!');
    router.push('/tamago');
    return;
  }
  
  if (currentPet.value.energy < 10) {
    alert('⚠️ Not enough energy! Your Tamagotchi needs at least 10 energy to play.\nLet it rest!');
    return;
  }
  
  // Consommer l'énergie au début de la partie (-10)
  try {
    const petId = currentPet.value._id;
    const newEnergy = Math.max(0, currentPet.value.energy - 10);
    
    await petsStore.updatePet(petId, { energy: newEnergy });
    await petsStore.fetchPet(petId);
    
    console.log('✅ Energy consumed: -10');
  } catch (error) {
    console.error('❌ Error consuming energy:', error);
    alert('Error starting game. Please try again.');
    return;
  }
  
  // Créer les paires (2 cartes de chaque Tamagotchi)
  const pairs = [];
  tamagotchis.forEach(tama => {
    pairs.push({ ...tama, flipped: false, matched: false, wrong: false });
    pairs.push({ ...tama, flipped: false, matched: false, wrong: false });
  });
  
  // Mélanger les cartes (Fisher-Yates shuffle)
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  cards.value = pairs;
  flippedCards.value = [];
  moves.value = 0;
  pairsFound.value = 0;
  canFlip.value = true;
};

// Gérer le clic sur une carte
const handleCardClick = (index) => {
  const card = cards.value[index];
  
  // Ne rien faire si :
  // - La carte est déjà retournée
  // - La carte est déjà trouvée
  // - On ne peut pas retourner (animation en cours)
  // - Deux cartes sont déjà retournées
  if (!canFlip.value || card.flipped || card.matched || flippedCards.value.length === 2) {
    return;
  }
  
  // Retourner la carte
  card.flipped = true;
  flippedCards.value.push(index);
  
  // Si c'est la deuxième carte retournée
  if (flippedCards.value.length === 2) {
    moves.value++;
    canFlip.value = false;
    
    const [firstIndex, secondIndex] = flippedCards.value;
    const firstCard = cards.value[firstIndex];
    const secondCard = cards.value[secondIndex];
    
    // Vérifier si c'est une paire
    if (firstCard.id === secondCard.id) {
      // Paire trouvée !
      setTimeout(() => {
        firstCard.matched = true;
        secondCard.matched = true;
        pairsFound.value++;
        flippedCards.value = [];
        canFlip.value = true;
      }, 500);
    } else {
      // Pas la bonne paire
      firstCard.wrong = true;
      secondCard.wrong = true;
      
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;
        firstCard.wrong = false;
        secondCard.wrong = false;
        flippedCards.value = [];
        canFlip.value = true;
      }, 1000);
    }
  }
};

// Réinitialiser le jeu
const resetGame = () => {
  initGame();
};

// Watcher pour détecter la victoire et ajouter du fun
watch(gameWon, async (newVal) => {
  if (newVal && currentPet.value) {
    try {
      const petId = currentPet.value._id;
      const newFun = Math.min(100, currentPet.value.fun + 10);
      
      await petsStore.updatePet(petId, { fun: newFun });
      await petsStore.fetchPet(petId);
      
      console.log('🎉 Victory! Fun increased: +10');
    } catch (error) {
      console.error('❌ Error updating fun:', error);
    }
  }
});

// Navigation
const goBack = () => {
  router.push('/tamago');
};

onMounted(async () => {
  // Charger le pet actuel
  try {
    if (!petsStore.currentPet && petsStore.petsList.length === 0) {
      await petsStore.fetchPets({ limit: 1 });
    }
    if (petsStore.petsList.length > 0 && !petsStore.currentPet) {
      await petsStore.fetchPet(petsStore.petsList[0]._id);
    }
  } catch (error) {
    console.error('Error loading pet:', error);
  }
  
  initGame();
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20px;
}

.backButton {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem;
  background-color: #fff;
  border: 4px solid #000;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
}

.backButton:hover {
  transform: scale(1.05);
}

.backButton:active {
  transform: scale(0.98);
}

.backIcon {
  width: 28px;
  height: 28px;
  object-fit: contain;
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

.gameStats {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.statBox {
  background-color: #fff;
  border: 3px solid #000;
  border-radius: 12px;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.statLabel {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.statValue {
  font-size: 28px;
  font-weight: 700;
  color: #000;
}

.resetButton,
.playAgainButton {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6bcf7f 0%, #5ab36b 100%);
  border: 3px solid #000;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', sans-serif;
  color: #fff;
}

.playAgainButton {
  background: linear-gradient(135deg, #ffd93d 0%, #ffc107 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.resetButton:hover,
.playAgainButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.memoryGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.card:hover .cardInner {
  transform: scale(1.05);
}

.cardInner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .cardInner {
  transform: rotateY(180deg);
}

.card.matched .cardInner {
  opacity: 0.6;
}

.card.wrong .cardInner {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% {
    transform: rotateY(180deg) translateX(0);
  }
  25% {
    transform: rotateY(180deg) translateX(-10px);
  }
  75% {
    transform: rotateY(180deg) translateX(10px);
  }
}

.cardFront,
.cardBack {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  border: 3px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cardFront {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}

.cardBack {
  background-color: #fff;
  transform: rotateY(180deg);
  padding: 10px;
}

.cardBack img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.winMessage {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #ffd93d 0%, #ffc107 100%);
  border: 4px solid #000;
  border-radius: 16px;
  max-width: 500px;
  margin: 30px auto 0;
  animation: bounceIn 0.6s;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.winMessage h2 {
  font-size: 32px;
  margin: 0 0 12px;
  color: #000;
}

.winMessage p {
  font-size: 20px;
  margin: 0;
  color: #333;
}

@media (max-width: 768px) {
  .title {
    font-size: 32px;
  }
  
  .subtitle {
    font-size: 14px;
  }
  
  .memoryGrid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 10px;
  }
  
  .gameStats {
    gap: 12px;
  }
  
  .statBox {
    padding: 8px 16px;
  }
  
  .statValue {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .memoryGrid {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }
  
  .cardFront,
  .cardBack {
    border-width: 2px;
  }
}
</style>
