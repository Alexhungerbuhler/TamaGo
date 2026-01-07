<template>
  <div :class="$style.gameCard" @click="handleClick">
    <div :class="$style.cardContent">
      <!-- Icône du jeu -->
      <div :class="$style.gameIcon">
        {{ game.icon }}
      </div>
      
      <!-- Nom du jeu -->
      <h3 :class="$style.gameName">{{ game.name }}</h3>
      
      <!-- Description -->
      <p :class="$style.gameDescription">{{ game.description }}</p>
      
      <!-- Stats du jeu -->
      <div :class="$style.gameStats">
        <div :class="[$style.statItem, $style.funStat]">
          <span :class="$style.statIcon">😄</span>
          <span :class="$style.statValue">+{{ game.funBonus }}</span>
        </div>
        <div :class="[$style.statItem, $style.energyStat]">
          <span :class="$style.statIcon">⚡</span>
          <span :class="$style.statValue">-{{ game.energyCost }}</span>
        </div>
        <div :class="[$style.statItem, $style.hungerStat]">
          <span :class="$style.statIcon">🍎</span>
          <span :class="$style.statValue">-{{ game.hungerCost }}</span>
        </div>
      </div>
      
      <!-- Badge de difficulté -->
      <div :class="[$style.difficultyBadge, $style[`difficulty${capitalize(game.difficulty)}`]]">
        {{ game.difficulty }}
      </div>
      
      <!-- Bouton Play -->
      <button :class="$style.playButton" @click.stop="handlePlay">
        <span :class="$style.playIcon">▶</span>
        Play
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['play', 'select']);

const handleClick = () => {
  emit('select', props.game);
};

const handlePlay = () => {
  emit('play', props.game);
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
</script>

<style module>
.gameCard {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid #000;
  position: relative;
  overflow: hidden;
  font-family: 'Pixelify Sans', sans-serif;
}

.gameCard:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: #6bcf7f;
}

.cardContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.gameIcon {
  font-size: 64px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.gameName {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.5);
}

.gameDescription {
  font-size: 14px;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.5;
  min-height: 42px;
}

.gameStats {
  display: flex;
  gap: 16px;
  margin: 8px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.statItem {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid #000;
  font-weight: 700;
}

.funStat {
  border-color: #6bcf7f;
  background-color: rgba(107, 207, 127, 0.2);
}

.energyStat {
  border-color: #ffd93d;
  background-color: rgba(255, 217, 61, 0.2);
}

.hungerStat {
  border-color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.2);
}

.statIcon {
  font-size: 16px;
}

.statValue {
  font-size: 14px;
  color: #000;
}

.difficultyBadge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border: 2px solid #000;
  background-color: #fff;
}

.difficultyEasy {
  background-color: #6bcf7f;
  color: #000;
}

.difficultyMedium {
  background-color: #ffd93d;
  color: #000;
}

.difficultyHard {
  background-color: #ff6b6b;
  color: #fff;
}

.playButton {
  margin-top: 8px;
  padding: 12px 32px;
  border: 3px solid #000;
  border-radius: 12px;
  background: linear-gradient(135deg, #6bcf7f 0%, #5ab86e 100%);
  color: #000;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Pixelify Sans', sans-serif;
  box-shadow: 0 4px 0 #2d5f3a;
}

.playButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #2d5f3a;
}

.playButton:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #2d5f3a;
}

.playIcon {
  font-size: 16px;
}
</style>
