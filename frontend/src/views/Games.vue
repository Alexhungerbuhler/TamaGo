<template>
  <div :class="$style.gamesPage">
    <!-- Background -->
    <img :class="$style.background" src="/background/background.svg" alt="background" />
    
    <!-- Menu de sélection des jeux -->
    <div v-if="!selectedGame" :class="$style.gameMenu">
      <div :class="$style.menuHeader">
        <button :class="$style.backButton" @click="goBack">
          <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" :class="$style.backIcon" />
        </button>
        <h1 :class="$style.menuTitle">Arcade</h1>
        <p :class="$style.menuSubtitle">Choose a game to play!</p>
      </div>
      
      <div :class="$style.gameCards">
        <div :class="$style.gameCard" @click="selectGame('memory')">
          <img :class="$style.gameIcon" src="/icons/card.png" alt="Memory" />
          <h2 :class="$style.gameCardTitle">Memory</h2>
          <p :class="$style.gameCardDesc">Match Tamagotchi pairs</p>
          <div :class="$style.gameCardCost">
            <span>+25</span>
            <span>+25</span>
          </div>
        </div>
        
        <div :class="$style.gameCard" @click="selectGame('catch')">
          <img :class="$style.gameIcon" src="/icons/basket.png" alt="Catch Game" />
          <h2 :class="$style.gameCardTitle">Catch Game</h2>
          <p :class="$style.gameCardDesc">Catch falling Tamagotchis</p>
          <div :class="$style.gameCardCost">
            <span>+25</span>
            <span>+25</span>
          </div>
        </div>
        
        <div :class="$style.gameCard" @click="selectGame('simon')">
          <img :class="$style.gameIcon" src="/icons/brain.png" alt="Simon Says" />
          <h2 :class="$style.gameCardTitle">Simon Says</h2>
          <p :class="$style.gameCardDesc">Repeat the sequence</p>
          <div :class="$style.gameCardCost">
            <span>+25</span>
            <span>+25</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Memory Game -->
    <div v-if="selectedGame === 'memory'" :class="$style.gameContainer">
      <div :class="$style.header">
        <button :class="$style.backButton" @click="backToMenu">
          <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" :class="$style.backIcon" />
        </button>
        <h1 :class="$style.title">Memory Game</h1>
        <p :class="$style.subtitle">Find all the Tamagotchi pairs!</p>
      </div>
      
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
          v-if="memoryWon" 
          :class="$style.playAgainButton" 
          @click="resetMemory"
        >
          Play Again
        </button>
        <button 
          v-else 
          :class="$style.resetButton" 
          @click="resetMemory"
        >
          Restart
        </button>
      </div>
      
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
            <div :class="$style.cardFront"></div>
            <div :class="$style.cardBack">
              <img :src="card.image" :alt="card.name" />
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="memoryWon" :class="$style.winMessage">
        <h2>Congratulations!</h2>
        <p>You found all pairs in {{ moves }} moves!</p>
      </div>
    </div>
    
    <!-- Catch Game -->
    <div v-if="selectedGame === 'catch'" :class="$style.gameContainer">
      <div :class="$style.header">
        <button :class="$style.backButton" @click="backToMenu">
          <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" :class="$style.backIcon" />
        </button>
        <h1 :class="$style.title">Catch Game</h1>
        <p :class="$style.subtitle">Catch the falling Tamagotchis!</p>
      </div>
      
      <div :class="$style.gameStats">
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Score</span>
          <span :class="$style.statValue">{{ catchScore }}</span>
        </div>
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Time</span>
          <span :class="$style.statValue">{{ catchTimeLeft }}s</span>
        </div>
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Goal</span>
          <span :class="$style.statValue">{{ catchCurrentGoal }}</span>
        </div>
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Best</span>
          <span :class="$style.statValue">{{ catchRecord }}</span>
        </div>
      </div>
      
      <div 
        v-if="!catchGameStarted"
        :class="$style.catchStartScreen"
      >
        <div :class="$style.catchInstructions">
          <h2>How to Play</h2>
          <p>Catch {{ catchCurrentGoal }} Tamagotchis in {{ CATCH_DURATION }}s to win!</p>
          <p>Use Arrow Keys or Touch to move the basket</p>
          <p v-if="catchRecord > 0" style="color: #ffd93d; font-weight: 700; margin-top: 12px;">Your Best: {{ catchRecord }}</p>
          <button :class="$style.startButton" @click="startCatchGame">
            Start Game
          </button>
        </div>
      </div>
      
      <div 
        v-else
        ref="catchGameArea"
        :class="$style.catchGameArea"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Falling Tamagotchis -->
        <div
          v-for="item in fallingItems"
          :key="item.id"
          :class="$style.fallingItem"
          :style="{
            left: item.x + 'px',
            top: item.y + 'px'
          }"
        >
          <img :src="item.image" :alt="item.name" />
        </div>
        
        <!-- Basket -->
        <div
          :class="$style.basket"
          :style="{ left: basketX + 'px' }"
        >
          <img :class="$style.basketImage" src="/icons/basket.png" alt="Basket" />
        </div>
      </div>
      
      <!-- Arrow Controls -->
      <div v-if="catchGameStarted && !catchGameOver" :class="$style.arrowControls">
        <img 
          :class="$style.arrowLeft" 
          src="/Arrows/fleches droite et gauche 2.svg" 
          alt="Left arrow" 
          @mousedown="startMovingLeft"
          @mouseup="stopMoving"
          @mouseleave="stopMoving"
          @touchstart.prevent="startMovingLeft"
          @touchend.prevent="stopMoving"
        />
        <img 
          :class="$style.arrowRight" 
          src="/Arrows/fleches droite et gauche 1.svg" 
          alt="Right arrow" 
          @mousedown="startMovingRight"
          @mouseup="stopMoving"
          @mouseleave="stopMoving"
          @touchstart.prevent="startMovingRight"
          @touchend.prevent="stopMoving"
        />
      </div>
      
      <!-- Game Over / Win screens -->
      <div v-if="catchGameOver && !catchWon" :class="$style.gameOverMessage">
        <h2>Time's Up!</h2>
        <p>You caught {{ catchScore }} Tamagotchis</p>
        <p>You needed {{ catchCurrentGoal - (catchWon ? 1 : 0) }} to win</p>
        <p v-if="catchRecord > 0" style="margin-top: 12px; color: #ffd93d; font-weight: 700;">Best: {{ catchRecord }}</p>
        <button :class="$style.playAgainButton" @click="resetCatchGame">
          Play Again
        </button>
      </div>
      
      <div v-if="catchWon" :class="$style.winMessage">
        <h2>Victory!</h2>
        <p>You caught {{ catchScore }} Tamagotchis!</p>
        <p style="margin-top: 8px; font-size: 18px;">Next Goal: {{ catchCurrentGoal }}</p>
        <p v-if="catchRecord > 0" style="margin-top: 8px; color: #2d7a4d; font-weight: 700;">Best: {{ catchRecord }}</p>
        <button :class="$style.playAgainButton" @click="resetCatchGame">
          Play Again
        </button>
      </div>
    </div>
    
    <!-- Simon Says Game -->
    <div v-if="selectedGame === 'simon'" :class="$style.gameContainer">
      <div :class="$style.header">
        <button :class="$style.backButton" @click="backToMenu">
          <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" :class="$style.backIcon" />
        </button>
        <h1 :class="$style.title">Simon Says</h1>
        <p :class="$style.subtitle">Repeat the sequence!</p>
      </div>
      
      <div :class="$style.gameStats">
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Round</span>
          <span :class="$style.statValue">{{ simonRound }}/10</span>
        </div>
        <div :class="$style.statBox">
          <span :class="$style.statLabel">Status</span>
          <span :class="$style.statValue">{{ simonStatus }}</span>
        </div>
      </div>
      
      <div 
        v-if="!simonGameStarted"
        :class="$style.simonStartScreen"
      >
        <div :class="$style.simonInstructions">
          <h2>How to Play</h2>
          <p>Watch the Tamagotchis light up in sequence</p>
          <p>Click them in the same order</p>
          <p>Each round adds one more to the sequence</p>
          <p>Complete 10 rounds to win!</p>
          <button :class="$style.startButton" @click="startSimonGame">
            Start Game
          </button>
        </div>
      </div>
      
      <div 
        v-else
        :class="$style.simonGameArea"
      >
        <div :class="$style.simonGrid">
          <div
            v-for="(tama, index) in tamagotchis"
            :key="tama.id"
            :class="[
              $style.simonTamagotchi,
              { 
                [$style.simonActive]: simonActiveTama === index,
                [$style.simonClickable]: simonPlayerTurn && !simonGameOver
              }
            ]"
            @click="handleSimonClick(index)"
          >
            <img :src="tama.image" :alt="tama.name" />
          </div>
        </div>
      </div>
      
      <!-- Game Over / Win screens -->
      <div v-if="simonGameOver && !simonWon" :class="$style.gameOverMessage">
        <h2>Wrong Sequence!</h2>
        <p>You reached round {{ simonRound }}</p>
        <p>Try again to reach round 10!</p>
        <button :class="$style.playAgainButton" @click="resetSimonGame">
          Play Again
        </button>
      </div>
      
      <div v-if="simonWon" :class="$style.winMessage">
        <h2>Perfect!</h2>
        <p>You completed all 10 rounds!</p>
        <button :class="$style.playAgainButton" @click="resetSimonGame">
          Play Again
        </button>
      </div>
    </div>

    <!-- Modal d'alerte d'énergie -->
    <div v-if="showEnergyModal" :class="$style.modalOverlay" @click.self="showEnergyModal = false">
      <div :class="$style.modalContainer">
        <div :class="$style.modalContent">
          <h2 :class="$style.modalTitle">
            <img src="/icons/TriangleWarningIcon.svg" :class="$style.titleWarningIcon" alt="warning">
            Not Enough Energy!
          </h2>
          <p :class="$style.modalWarning">
            Your Tamagotchi needs to rest. Energy will automatically recharge to 100% in 5 minutes after reaching 0.
          </p>

          <div :class="$style.modalButtons">
            <button 
              :class="$style.btnCancel"
              @click="showEnergyModal = false"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePetsStore } from '../store/pets';

const router = useRouter();
const petsStore = usePetsStore();

// ========== GÉNÉRAL ==========
const currentPet = computed(() => petsStore.currentPet || (petsStore.petsList.length > 0 ? petsStore.petsList[0] : null));
const selectedGame = ref(null);
const showEnergyModal = ref(false);

const tamagotchis = [
  { id: 1, name: 'Buisson', image: '/Pets/buisson 1.png' },
  { id: 2, name: 'Chat Feu', image: '/Pets/chatFeu 1.png' },
  { id: 3, name: 'Goutte', image: '/Pets/goute 1.png' },
  { id: 4, name: 'Mystère', image: '/Pets/jspcestquoi.png' },
  { id: 5, name: 'Raichu', image: '/Pets/raichu.png' },
  { id: 6, name: 'Renard', image: '/Pets/renarddelumiere 1.png' }
];

// ========== MEMORY GAME ==========
const cards = ref([]);
const flippedCards = ref([]);
const moves = ref(0);
const pairsFound = ref(0);
const canFlip = ref(true);

const memoryWon = computed(() => pairsFound.value === 6);

const initMemory = async () => {
  if (!currentPet.value) {
    alert('❌ You need a Tamagotchi to play!');
    router.push('/tamago');
    return;
  }
  
  if (currentPet.value.energy < 25) {
    showEnergyModal.value = true;
    return;
  }
  
  const pairs = [];
  tamagotchis.forEach(tama => {
    pairs.push({ ...tama, flipped: false, matched: false, wrong: false });
    pairs.push({ ...tama, flipped: false, matched: false, wrong: false });
  });
  
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

const handleCardClick = (index) => {
  const card = cards.value[index];
  
  if (!canFlip.value || card.flipped || card.matched || flippedCards.value.length === 2) {
    return;
  }
  
  card.flipped = true;
  flippedCards.value.push(index);
  
  if (flippedCards.value.length === 2) {
    moves.value++;
    canFlip.value = false;
    
    const [firstIndex, secondIndex] = flippedCards.value;
    const firstCard = cards.value[firstIndex];
    const secondCard = cards.value[secondIndex];
    
    if (firstCard.id === secondCard.id) {
      setTimeout(() => {
        firstCard.matched = true;
        secondCard.matched = true;
        pairsFound.value++;
        flippedCards.value = [];
        canFlip.value = true;
      }, 500);
    } else {
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

const resetMemory = () => {
  initMemory();
};

watch(memoryWon, async (newVal) => {
  if (newVal && currentPet.value) {
    try {
      const petId = currentPet.value._id;
      const newFun = Math.min(100, currentPet.value.fun + 25);
      const newEnergy = Math.max(0, currentPet.value.energy - 25);
      
      await petsStore.updatePet(petId, { fun: newFun, energy: newEnergy });
      await petsStore.fetchPet(petId);
      await petsStore.incrementGames(petId);
      
      console.log('🎉 Memory Victory! Fun: +25, Energy: -25');
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  }
});

// ========== CATCH GAME ==========
const CATCH_DURATION = 30; // secondes
const CATCH_SPAWN_INTERVAL = 800; // millisecondes
const FALL_SPEED = 2; // pixels par frame (base speed)
const FALL_SPEED_MAX = 4; // pixels par frame (max random speed for difficulty)
const BASKET_SPEED = 8; // pixels par frame
const BASKET_WIDTH = 80;
const ITEM_SIZE = 50;

// Charger le goal et le record depuis localStorage pour le pet actuel
const loadCatchGameProgress = () => {
  const petId = currentPet.value?._id || currentPet.value?.id;
  if (!petId) {
    return { currentGoal: 15, record: 0 };
  }
  const savedGoal = localStorage.getItem(`catchGame_currentGoal_${petId}`);
  const savedRecord = localStorage.getItem(`catchGame_record_${petId}`);
  return {
    currentGoal: savedGoal ? parseInt(savedGoal) : 15,
    record: savedRecord ? parseInt(savedRecord) : 0
  };
};

const catchGameProgress = loadCatchGameProgress();
const catchCurrentGoal = ref(catchGameProgress.currentGoal);
const catchRecord = ref(catchGameProgress.record);

const catchGameArea = ref(null);
const catchScore = ref(0);
const catchTimeLeft = ref(CATCH_DURATION);
const catchGameStarted = ref(false);
const catchGameOver = ref(false);
const catchWon = ref(false);

const basketX = ref(0);
const fallingItems = ref([]);
let catchGameLoop = null;
let catchSpawnLoop = null;
let catchTimerLoop = null;
let itemIdCounter = 0;

const keysPressed = ref({
  ArrowLeft: false,
  ArrowRight: false
});

const touchStartX = ref(0);
const touchCurrentX = ref(0);

const startCatchGame = async () => {
  if (!currentPet.value) {
    alert('❌ You need a Tamagotchi to play!');
    router.push('/tamago');
    return;
  }
  
  if (currentPet.value.energy < 25) {
    showEnergyModal.value = true;
    return;
  }
  
  catchGameStarted.value = true;
  catchScore.value = 0;
  catchTimeLeft.value = CATCH_DURATION;
  catchGameOver.value = false;
  catchWon.value = false;
  fallingItems.value = [];
  
  // Position initiale du panier au centre
  setTimeout(() => {
    if (catchGameArea.value) {
      const gameWidth = catchGameArea.value.offsetWidth;
      basketX.value = (gameWidth - BASKET_WIDTH) / 2;
    }
  }, 0);
  
  // Démarrer les intervalles
  catchSpawnLoop = setInterval(spawnFallingItem, CATCH_SPAWN_INTERVAL);
  catchGameLoop = requestAnimationFrame(updateCatchGame);
  catchTimerLoop = setInterval(() => {
    catchTimeLeft.value--;
    if (catchTimeLeft.value <= 0) {
      endCatchGame();
    }
  }, 1000);
};

const spawnFallingItem = () => {
  if (!catchGameArea.value || catchGameOver.value) return;
  
  const gameWidth = catchGameArea.value.offsetWidth;
  const randomX = Math.random() * (gameWidth - ITEM_SIZE);
  const randomTama = tamagotchis[Math.floor(Math.random() * tamagotchis.length)];
  // Random speed between FALL_SPEED and FALL_SPEED_MAX for difficulty variation
  const randomSpeed = FALL_SPEED + Math.random() * (FALL_SPEED_MAX - FALL_SPEED);
  
  fallingItems.value.push({
    id: itemIdCounter++,
    x: randomX,
    y: -ITEM_SIZE,
    image: randomTama.image,
    name: randomTama.name,
    speed: randomSpeed
  });
};

const updateCatchGame = () => {
  if (!catchGameArea.value || catchGameOver.value) return;
  
  const gameHeight = catchGameArea.value.offsetHeight;
  const gameWidth = catchGameArea.value.offsetWidth;
  
  // Mettre à jour les items qui tombent
  fallingItems.value = fallingItems.value.filter(item => {
    // Use item's own speed (random) instead of constant
    item.y += item.speed || FALL_SPEED;
    
    // Vérifier collision avec le panier
    const basketY = gameHeight - 100; // Position du panier
    if (
      item.y + ITEM_SIZE >= basketY &&
      item.y <= basketY + 60 &&
      item.x + ITEM_SIZE >= basketX.value &&
      item.x <= basketX.value + BASKET_WIDTH
    ) {
      catchScore.value++;
      
      // Vérifier victoire
      if (catchScore.value >= catchCurrentGoal.value) {
        winCatchGame();
      }
      
      return false; // Supprimer l'item
    }
    
    // Supprimer si hors écran
    if (item.y > gameHeight) {
      return false;
    }
    
    return true;
  });
  
  // Déplacer le panier avec clavier
  if (keysPressed.value.ArrowLeft) {
    basketX.value = Math.max(0, basketX.value - BASKET_SPEED);
  }
  if (keysPressed.value.ArrowRight) {
    basketX.value = Math.min(gameWidth - BASKET_WIDTH, basketX.value + BASKET_SPEED);
  }
  
  catchGameLoop = requestAnimationFrame(updateCatchGame);
};

const winCatchGame = async () => {
  catchGameOver.value = true;
  catchWon.value = true;
  stopCatchGame();
  
  // Mettre à jour le record si nécessaire
  const petId = currentPet.value?._id || currentPet.value?.id;
  if (catchScore.value > catchRecord.value) {
    catchRecord.value = catchScore.value;
    if (petId) {
      localStorage.setItem(`catchGame_record_${petId}`, catchRecord.value.toString());
    }
    console.log('🏆 New Best:', catchRecord.value);
  }
  
  // Augmenter le goal pour la prochaine partie
  catchCurrentGoal.value++;
  if (petId) {
    localStorage.setItem(`catchGame_currentGoal_${petId}`, catchCurrentGoal.value.toString());
  }
  console.log('📈 Next Goal:', catchCurrentGoal.value);
  
  // Récompenses
  if (currentPet.value) {
    try {
      const petId = currentPet.value._id;
      const newFun = Math.min(100, currentPet.value.fun + 25);
      const newEnergy = Math.max(0, currentPet.value.energy - 25);
      
      await petsStore.updatePet(petId, { fun: newFun, energy: newEnergy });
      await petsStore.fetchPet(petId);
      await petsStore.incrementGames(petId);
      
      console.log('🎉 Catch Game Victory! Fun: +25, Energy: -25');
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  }
};

const endCatchGame = () => {
  catchGameOver.value = true;
  stopCatchGame();
};

const stopCatchGame = () => {
  if (catchSpawnLoop) clearInterval(catchSpawnLoop);
  if (catchTimerLoop) clearInterval(catchTimerLoop);
  if (catchGameLoop) cancelAnimationFrame(catchGameLoop);
};

const resetCatchGame = () => {
  stopCatchGame();
  catchGameStarted.value = false;
  catchGameOver.value = false;
  catchWon.value = false;
  catchScore.value = 0;
  catchTimeLeft.value = CATCH_DURATION;
  fallingItems.value = [];
  // Relancer le jeu après un court délai
  setTimeout(() => {
    startCatchGame();
  }, 100);
};

const handleKeyDown = (e) => {
  if (e.key in keysPressed.value) {
    keysPressed.value[e.key] = true;
  }
};

const handleKeyUp = (e) => {
  if (e.key in keysPressed.value) {
    keysPressed.value[e.key] = false;
  }
};

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
  touchCurrentX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  e.preventDefault();
  touchCurrentX.value = e.touches[0].clientX;
  const deltaX = touchCurrentX.value - touchStartX.value;
  
  if (catchGameArea.value) {
    const gameWidth = catchGameArea.value.offsetWidth;
    basketX.value = Math.max(0, Math.min(gameWidth - BASKET_WIDTH, basketX.value + deltaX * 0.5));
  }
  
  touchStartX.value = touchCurrentX.value;
};

const handleTouchEnd = () => {
  touchStartX.value = 0;
  touchCurrentX.value = 0;
};

// Arrow button handlers
const startMovingLeft = () => {
  keysPressed.value.ArrowLeft = true;
};

const startMovingRight = () => {
  keysPressed.value.ArrowRight = true;
};

const stopMoving = () => {
  keysPressed.value.ArrowLeft = false;
  keysPressed.value.ArrowRight = false;
};

// ========== SIMON SAYS GAME ==========
const SIMON_WIN_ROUNDS = 10;

const simonGameStarted = ref(false);
const simonGameOver = ref(false);
const simonWon = ref(false);
const simonRound = ref(0);
const simonSequence = ref([]);
const simonPlayerSequence = ref([]);
const simonPlayerTurn = ref(false);
const simonActiveTama = ref(-1);
const simonStatus = ref('Watch');

const startSimonGame = async () => {
  if (!currentPet.value) {
    alert('❌ You need a Tamagotchi to play!');
    router.push('/tamago');
    return;
  }
  
  if (currentPet.value.energy < 25) {
    showEnergyModal.value = true;
    return;
  }
  
  simonGameStarted.value = true;
  simonGameOver.value = false;
  simonWon.value = false;
  simonRound.value = 1;
  simonSequence.value = [];
  simonPlayerSequence.value = [];
  
  // Démarrer le premier round
  setTimeout(() => {
    nextSimonRound();
  }, 1000);
};

const nextSimonRound = () => {
  simonPlayerTurn.value = false;
  simonPlayerSequence.value = [];
  simonStatus.value = 'Watch';
  
  // Ajouter un nouveau Tamagotchi à la séquence
  const randomIndex = Math.floor(Math.random() * tamagotchis.length);
  simonSequence.value.push(randomIndex);
  
  // Afficher la séquence
  setTimeout(() => {
    playSimonSequence();
  }, 500);
};

const playSimonSequence = async () => {
  for (let i = 0; i < simonSequence.value.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 600));
    simonActiveTama.value = simonSequence.value[i];
    await new Promise(resolve => setTimeout(resolve, 500));
    simonActiveTama.value = -1;
  }
  
  // Tour du joueur
  simonPlayerTurn.value = true;
  simonStatus.value = 'Your turn!';
};

const handleSimonClick = (index) => {
  if (!simonPlayerTurn.value || simonGameOver.value) return;
  
  // Animation de clic
  simonActiveTama.value = index;
  setTimeout(() => {
    simonActiveTama.value = -1;
  }, 300);
  
  simonPlayerSequence.value.push(index);
  
  // Vérifier si le clic est correct
  const currentStep = simonPlayerSequence.value.length - 1;
  if (simonSequence.value[currentStep] !== index) {
    // Mauvaise réponse
    simonGameOver.value = true;
    simonStatus.value = 'Wrong!';
    return;
  }
  
  // Vérifier si la séquence est complète
  if (simonPlayerSequence.value.length === simonSequence.value.length) {
    simonPlayerTurn.value = false;
    simonStatus.value = 'Correct!';
    
    // Vérifier victoire
    if (simonRound.value >= SIMON_WIN_ROUNDS) {
      setTimeout(() => {
        winSimonGame();
      }, 800);
    } else {
      // Round suivant
      simonRound.value++;
      setTimeout(() => {
        nextSimonRound();
      }, 1500);
    }
  }
};

const winSimonGame = async () => {
  simonGameOver.value = true;
  simonWon.value = true;
  simonStatus.value = 'Victory!';
  
  // Récompenses
  if (currentPet.value) {
    try {
      const petId = currentPet.value._id;
      const newFun = Math.min(100, currentPet.value.fun + 25);
      const newEnergy = Math.max(0, currentPet.value.energy - 25);
      
      await petsStore.updatePet(petId, { fun: newFun, energy: newEnergy });
      await petsStore.fetchPet(petId);
      await petsStore.incrementGames(petId);
      
      console.log('🎉 Simon Says Victory! Fun: +25, Energy: -25');
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  }
};

const resetSimonGame = () => {
  simonGameStarted.value = false;
  simonGameOver.value = false;
  simonWon.value = false;
  simonRound.value = 0;
  simonSequence.value = [];
  simonPlayerSequence.value = [];
  simonPlayerTurn.value = false;
  simonActiveTama.value = -1;
  simonStatus.value = 'Watch';
  // Relancer le jeu après un court délai
  setTimeout(() => {
    startSimonGame();
  }, 100);
};

// ========== NAVIGATION ==========
const selectGame = (game) => {
  selectedGame.value = game;
  if (game === 'memory') {
    initMemory();
  }
};

const backToMenu = () => {
  stopCatchGame();
  selectedGame.value = null;
  catchGameStarted.value = false;
  catchGameOver.value = false;
  catchWon.value = false;
  fallingItems.value = [];
  
  // Reset Simon Says
  simonGameStarted.value = false;
  simonGameOver.value = false;
  simonWon.value = false;
  simonRound.value = 0;
  simonSequence.value = [];
  simonPlayerSequence.value = [];
  simonPlayerTurn.value = false;
  simonActiveTama.value = -1;
  simonStatus.value = 'Watch';
};

const goBack = () => {
  router.push('/tamago');
};

// ========== LIFECYCLE ==========
onMounted(async () => {
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
  
  // Event listeners pour le clavier
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
  stopCatchGame();
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>

<style module>
/* ========== BASE ========== */
.gamesPage {
  width: 100%;
  height: 100vh;
  height: 100svh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #c0fe90;
  padding: 20px;
  font-family: 'Pixelify Sans', sans-serif;
  overflow-y: auto;
  box-sizing: border-box;
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

/* ========== MENU ========== */
.gameMenu {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.menuHeader {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  width: 100%;
}

.menuTitle {
  font-size: 64px;
  font-weight: 700;
  color: #000;
  margin: 0 0 12px;
  text-shadow: 4px 4px 0 rgba(255, 255, 255, 0.5);
}

.menuSubtitle {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.gameCards {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 800px;
}

.gameCard {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: 4px solid #000;
  border-radius: 20px;
  padding: 30px;
  width: 250px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.gameCard:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffd93d 0%, #ffc107 100%);
}

.gameCard:active {
  transform: translateY(-4px);
}

.gameIcon {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  object-fit: contain;
}

.gameCardTitle {
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin: 0 0 8px;
}

.gameCardDesc {
  font-size: 16px;
  color: #555;
  margin: 0 0 16px;
}

.gameCardCost {
  display: flex;
  gap: 16px;
  font-size: 18px;
  font-weight: 600;
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

/* ========== GAME CONTAINER ========== */
.gameContainer {
  position: relative;
  z-index: 1;
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
.playAgainButton,
.startButton {
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

.startButton {
  font-size: 24px;
  padding: 16px 48px;
  margin-top: 20px;
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
.playAgainButton:hover,
.startButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

/* ========== MEMORY GAME ========== */
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

/* ========== CATCH GAME ========== */
.catchStartScreen {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.catchInstructions {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: 4px solid #000;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
}

.catchInstructions h2 {
  font-size: 32px;
  margin: 0 0 20px;
  color: #000;
}

.catchInstructions p {
  font-size: 18px;
  margin: 12px 0;
  color: #333;
}

.catchGameArea {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 20px auto 0;
  background: linear-gradient(180deg, #87ceeb 0%, #e0f6ff 100%);
  border: 4px solid #000;
  border-radius: 16px;
  overflow: hidden;
  touch-action: none;
}

@media (min-width: 768px) {
  .catchGameArea {
    height: 600px;
  }
}

.fallingItem {
  position: absolute;
  width: 50px;
  height: 50px;
  transition: none;
  pointer-events: none;
}

.fallingItem img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.basket {
  position: absolute;
  bottom: 20px;
  width: 80px;
  height: 80px;
  transition: left 0.05s linear;
  display: flex;
  align-items: center;
  justify-content: center;
}

.basketImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}

.arrowControls {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  padding: 20px;
  margin-top: 20px;
}

@media (min-width: 768px) {
  .arrowControls {
    gap: 120px;
  }
}

.arrowLeft,
.arrowRight {
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  -webkit-user-select: none;
  filter: drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.3));
}

@media (min-width: 768px) {
  .arrowLeft,
  .arrowRight {
    width: 100px;
    height: 100px;
  }
}

.arrowLeft:hover,
.arrowRight:hover {
  transform: scale(1.1);
  filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.4));
}

.arrowLeft:active,
.arrowRight:active {
  transform: scale(1.05);
  filter: brightness(1.2);
}

/* ========== SIMON SAYS GAME ========== */
.simonStartScreen {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.simonInstructions {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: 4px solid #000;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
}

.simonInstructions h2 {
  font-size: 32px;
  margin: 0 0 20px;
  color: #000;
}

.simonInstructions p {
  font-size: 18px;
  margin: 12px 0;
  color: #333;
}

.simonGameArea {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 10px;
}

@media (min-width: 768px) {
  .simonGameArea {
    padding: 40px 20px;
  }
}

.simonGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.simonTamagotchi {
  aspect-ratio: 1;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: 3px solid #000;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
}

.simonTamagotchi img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s;
}

.simonClickable {
  cursor: pointer;
}

.simonClickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.simonActive {
  background: linear-gradient(135deg, #ffd93d 0%, #ffc107 100%);
  box-shadow: 0 0 30px rgba(255, 217, 61, 0.8);
  transform: scale(1.1);
  animation: simonPulse 0.5s ease-in-out;
}

@keyframes simonPulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(255, 217, 61, 0.8);
  }
  50% {
    box-shadow: 0 0 50px rgba(255, 217, 61, 1);
  }
}

.simonActive img {
  transform: scale(1.1);
}

/* ========== WIN/LOSE MESSAGES ========== */
.winMessage,
.gameOverMessage {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 30px;
  border: 4px solid #000;
  border-radius: 16px;
  max-width: 500px;
  margin: 30px auto 0;
  animation: bounceIn 0.6s;
}

.winMessage {
  background: linear-gradient(135deg, #ffd93d 0%, #ffc107 100%);
}

.gameOverMessage {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
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

.winMessage h2,
.gameOverMessage h2 {
  font-size: 32px;
  margin: 0 0 12px;
  color: #000;
}

.winMessage p,
.gameOverMessage p {
  font-size: 20px;
  margin: 8px 0;
  color: #333;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .menuTitle {
    font-size: 48px;
  }
  
  .menuSubtitle {
    font-size: 18px;
  }
  
  .gameCards {
    gap: 20px;
  }
  
  .gameCard {
    width: 200px;
    padding: 24px;
  }
  
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
  
  .catchGameArea {
    height: 400px;
  }
  
  .simonGrid {
    gap: 16px;
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
  
  .gameCard {
    width: 160px;
    padding: 20px;
  }
  
  .gameIcon {
    width: 60px;
    height: 60px;
  }
  
  .gameCardTitle {
    font-size: 22px;
  }
  
  .catchGameArea {
    height: 350px;
  }
  
  .simonGrid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .simonGrid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  
  .simonTamagotchi {
    border-width: 2px;
  }
}

/* ========== MODAL STYLES ========== */
.modalOverlay {
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

.modalContainer {
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

.modalContent {
  background: #ffffff;
  padding: 2rem;
  border: 5px solid #000000;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
}

.modalTitle {
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

.titleWarningIcon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.modalWarning {
  margin: 0 0 2rem;
  font-size: 1rem;
  color: #D5230C;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}

.modalButtons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btnCancel {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: 4px solid #000000;
  border-radius: 16px;
  cursor: pointer;
  font-family: 'Pixelify Sans', monospace;
  transition: all 0.2s;
  background: #627DE0;
  color: #ffffff;
}

.btnCancel:hover {
  background: #5169c7;
  transform: translateY(-2px);
}

.btnCancel:active {
  transform: translateY(0);
}
</style>
