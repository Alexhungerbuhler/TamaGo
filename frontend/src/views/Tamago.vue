<template>
  <div :class="$style.ecranDarrive">
    <!-- Background cloud element -->
    <img :class="$style.b4de0fe89384581A3938a7a175Icon" src="/background/background.svg" alt="background" />
    
    <!-- Top Stats Icons with Labels and Gauges -->
    <div :class="$style.topStatsContainer">
      <div 
        v-for="(icon, index) in topIcons"
        :key="index"
        :class="[$style.topStatItem, { [$style.blinking]: selectedIconIndex === index }]"
      >
        <img :class="$style.topIcon" :src="icon.src" :alt="icon.label" :title="icon.label" />
        <b :class="$style.topLabel">{{ icon.label }}</b>
        <!-- Gauge for stat value -->
        <div :class="$style.gaugeContainer">
          <div :class="$style.gauge" :style="{ width: getStatValue(icon.label) + '%' }"></div>
        </div>
        <span :class="$style.statValue">{{ getStatValue(icon.label) }}</span>
      </div>
    </div>
   
    
    <!-- Bottom Navigation Icons with Labels -->
    <div :class="$style.groupParent">
      <div 
        v-for="(icon, index) in bottomIcons"
        :key="index"
        :class="[$style.navItem, { [$style.blinking]: selectedBottomIndex === index }]"
      >
        <img :class="$style.navIcon" :src="icon.src" :alt="icon.label" :title="icon.label" />
        <b :class="$style.navLabel">{{ icon.label }}</b>
      </div>
    </div>
    
    <!-- Main content icons (can be replaced with actual images) -->
    <div :class="$style.eggPlaceholder" @click="handleEggClick">
      <img v-if="!isHatched" src="/Eggs/egg.svg" alt="Egg" title="Egg" :class="{ [$style.shake]: isShaking }" />
      <img v-else :src="hatchedPetImage" alt="Hatched Pet" title="Hatched Pet" :class="$style.hatchedPet" />
    </div>

    <!-- Pet name -->
    <b :class="$style.petName">{{ currentPet?.name || 'Tamagotchi' }}</b>
    
    <!-- Instruction text -->
    <b :class="$style.shakeYourPhone">
      <span v-if="!isHatched">Click {{ clicksNeeded - clickCount }} times<br/>to hatch the egg</span>
      <span v-else>🎉 Pet hatched!</span>
    </b>
    
    <!-- Navigation arrows -->
    <img :class="$style.arrowLeft" src="/Arrows/fleches droite et gauche 2.svg" alt="Left arrow" @click="handleLeftArrow" />
    <img :class="$style.arrowRight" src="/Arrows/fleches droite et gauche 1.svg" alt="Right arrow" @click="handleRightArrow" />
    
    <!-- USE Button -->
    <div :class="$style.pixilFrame01Parent" @click="handleUse">
      <img :class="$style.pixilFrame01Icon" src="/Arrows/Group 23.svg" alt="button-bg" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { usePetsStore } from '../store/pets';

const router = useRouter();
const petsStore = usePetsStore();
const selectedIconIndex = ref(0);
const currentPet = ref(null);

// Egg hatching system
const clickCount = ref(0);
const clicksNeeded = 5; // Number of clicks to hatch
const isHatched = ref(false);
const hatchedPetImage = ref('');
const isShaking = ref(false);

// Available pet images for hatching
const availablePets = [
  '/Pets/buisson 1.svg',
  '/Pets/chatFeu 1.svg',
  '/Pets/goute 1.svg',
  '/Pets/jspcestquoi 1.svg',
  '/Pets/raichu 1.svg',
  '/Pets/renarddelumiere 1.svg',
  '/Pets/tortuepierre 1.svg'
];

// Get random pet image
const getRandomPet = () => {
  return availablePets[Math.floor(Math.random() * availablePets.length)];
};

// Handle egg click - increment click count and check for hatching
const handleEggClick = () => {
  if (isHatched.value) return;
  
  clickCount.value++;
  console.log(`Egg clicked: ${clickCount.value}/${clicksNeeded}`);
  
  if (clickCount.value >= clicksNeeded) {
    hatchEgg();
  }
};

// Hatch the egg
const hatchEgg = () => {
  isHatched.value = true;
  hatchedPetImage.value = getRandomPet();
  console.log('Egg hatched! Pet:', hatchedPetImage.value);
};

// Reset egg (for testing or to hatch again)
const resetEgg = () => {
  isHatched.value = false;
  hatchedPetImage.value = '';
  clickCount.value = 0;
};

// Device shake detection for mobile
const handleDeviceShake = () => {
  if (isHatched.value) return;
  
  isShaking.value = true;
  console.log('Device shaken!');
  hatchEgg();
  
  // Reset shake indicator after animation
  setTimeout(() => {
    isShaking.value = false;
  }, 1000);
};

// Navigation functions (defined first so they can be referenced in allIcons)
const goToProfile = () => router.push('/profile');
const goToMap = () => router.push('/map');
const go1v1 = () => router.push('/tamagotchi');
const goToGames = () => router.push('/games');

// All icons in circular navigation order (top then bottom)
const allIcons = ref([
  // Top icons
  { label: 'Hunger', src: '/icons/Group-1.svg', section: 'top', key: 'hunger' },
  { label: 'Hygiene', src: '/icons/health-stool--Streamline-Pixel.svg', section: 'top', key: 'hygiene' },
  { label: 'Fun', src: '/icons/entertainment-events-hobbies-popcorn.svg', section: 'top', key: 'fun' },
  { label: 'Energy', src: '/icons/ecology-clean-battery.svg', section: 'top', key: 'energy' },
  // Bottom icons
  { label: 'Profile', src: '/icons/Group.svg', section: 'bottom', action: goToProfile },
  { label: 'Map', src: '/icons/map-navigation-location-focus.svg', section: 'bottom', action: goToMap },
  { label: '1v1', src: '/icons/Group-1.svg', section: 'bottom', action: go1v1 },
  { label: 'Games', src: '/icons/entertainment-events-hobbies-game-machines-arcade-1--Streamline-Pixel.svg', section: 'bottom', action: goToGames }
]);

// Top icons list (derived from allIcons)
const topIcons = computed(() => allIcons.value.slice(0, 4));

// Bottom icons list (derived from allIcons)
const bottomIcons = computed(() => allIcons.value.slice(4, 8));

// Get selected icon index in each section
const selectedTopIndex = computed(() => selectedIconIndex.value < 4 ? selectedIconIndex.value : -1);
const selectedBottomIndex = computed(() => selectedIconIndex.value >= 4 ? selectedIconIndex.value - 4 : -1);

// Handle left arrow - go left (previous icon in circular loop)
const handleLeftArrow = () => {
  selectedIconIndex.value = (selectedIconIndex.value - 1 + allIcons.value.length) % allIcons.value.length;
};

// Handle right arrow - go right (next icon in circular loop)
const handleRightArrow = () => {
  selectedIconIndex.value = (selectedIconIndex.value + 1) % allIcons.value.length;
};

// Get stat value for a given stat name
const getStatValue = (statName) => {
  if (!currentPet.value) return 0;
  
  const statKey = statName.toLowerCase();
  const value = currentPet.value[statKey] || 0;
  
  // Ensure value is between 0 and 100
  return Math.max(0, Math.min(100, value));
};

// Get current selected icon
const currentSelectedIcon = computed(() => {
  return allIcons.value[selectedIconIndex.value];
});

// Handle USE button - execute pet action based on currently selected icon
const handleUse = async () => {
  const icon = currentSelectedIcon.value;
  
  if (!icon || !currentPet.value?._id) return;
  
  try {
    const petId = currentPet.value._id;
    
    // Map icons to pet actions based on their key
    switch(icon.key) {
      case 'hunger':
        await petsStore.feedPet(petId);
        console.log('Hunger action: Pet fed');
        break;
      case 'hygiene':
        await petsStore.toiletPet(petId);
        console.log('Hygiene action: Pet cleaned');
        break;
      case 'fun':
        await petsStore.playWithPet(petId);
        console.log('Fun action: Pet played with');
        break;
      case 'energy':
        await petsStore.sleepPet(petId);
        console.log('Energy action: Pet slept');
        break;
      default:
        console.log('No action available for this icon');
    }
    
    // Refresh pet data to update gauges
    await petsStore.fetchPet(petId);
    currentPet.value = petsStore.currentPet;
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
  }
};

// Fetch the first pet's data on component mount
onMounted(async () => {
  try {
    await petsStore.fetchPets({ limit: 1 });
    if (petsStore.petsList.length > 0) {
      currentPet.value = petsStore.petsList[0];
    }
  } catch (error) {
    console.error('Erreur lors du chargement du pet:', error);
  }
  
  // Setup device shake listener for mobile
  let lastShakeTime = 0;
  const shakeThreshold = 15;
  const shakeTimeout = 500;
  
  const onDeviceMotion = (event) => {
    const acceleration = event.acceleration;
    if (!acceleration) return;
    
    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;
    
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
    
    if (totalAcceleration > shakeThreshold) {
      const now = Date.now();
      if (now - lastShakeTime > shakeTimeout) {
        handleDeviceShake();
        lastShakeTime = now;
      }
    }
  };
  
  // Request permission for iOS 13+
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', onDeviceMotion);
        }
      })
      .catch(console.error);
  } else {
    // For Android and older iOS
    window.addEventListener('devicemotion', onDeviceMotion);
  }
  
  // Cleanup
  return () => {
    window.removeEventListener('devicemotion', onDeviceMotion);
  };
});
</script>

<style module>
.ecranDarrive {
  width: 100%;
  height: 852px;
  position: relative;
  background-color: #c0fe90;
  overflow: hidden;
  text-align: left;
  font-size: 14px;
  color: #000;
  font-family: 'Pixelify Sans';
}

.b4de0fe89384581A3938a7a175Icon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
  z-index: 0;
}

.topIcon {
  position: relative;
  width: 32px;
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.topStatsContainer {
  position: absolute;
  top: 70px;
  left: calc(50% - 160px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 50px;
  flex-shrink: 0;
}

.topStatItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.topLabel {
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  color: #000;
  white-space: nowrap;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
}

.blinking {
  animation: blink 1.2s ease-in-out infinite;
}

.groupIcon {
  position: absolute;
  height: 2.86%;
  width: 8.14%;
  top: 10.45%;
  right: 78.12%;
  bottom: 86.69%;
  left: 13.74%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.ecranDarriveChild {
  position: absolute;
  top: 43px;
  left: -1px;
  background-color: rgba(255, 255, 255, 0);
  width: 394px;
  height: 104px;
  flex-shrink: 0;
}

.vectorIcon {
  position: absolute;
  height: 7.86%;
  width: 17.05%;
  top: 7.98%;
  right: 52.67%;
  bottom: 84.15%;
  left: 30.28%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.vectorIcon2 {
  position: absolute;
  height: 7.34%;
  width: 12.49%;
  top: 7.75%;
  right: 14.22%;
  bottom: 84.92%;
  left: 73.28%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.vectorIcon3 {
  position: absolute;
  height: 5.76%;
  width: 11.37%;
  top: 4.8%;
  right: 9.66%;
  bottom: 89.44%;
  left: 78.97%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.vectorIcon4 {
  position: absolute;
  height: 0.53%;
  top: 10.04%;
  bottom: 89.43%;
  left: 78.97%;
  max-height: 100%;
  width: 0px;
  flex-shrink: 0;
}

.vectorIcon5 {
  position: absolute;
  height: 7.86%;
  width: 17.05%;
  top: 7.98%;
  right: 31.81%;
  bottom: 84.15%;
  left: 51.15%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.vectorIcon6 {
  position: absolute;
  height: 7.86%;
  width: 17.05%;
  top: 7.86%;
  right: 73.54%;
  bottom: 84.27%;
  left: 9.41%;
  max-width: 100%;
  overflow: hidden;
  max-height: 100%;
  flex-shrink: 0;
}

.groupParent {
  position: absolute;
  top: 700px;
  left: calc(50% - 180px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 80px;
  flex-shrink: 0;
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.navItem:hover {
  transform: scale(1.1);
}

.navIcon {
  height: 32px;
  width: 32px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  object-fit: contain;
}

.navIcon:hover {
  transform: scale(1.2);
}

.navLabel {
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  color: #000;
}

.profile {
  position: absolute;
  top: 688px;
  left: 23px;
  flex-shrink: 0;
  display: none;
}

.hunger {
  position: absolute;
  top: 120px;
  left: 48px;
  flex-shrink: 0;
  font-size: 12px;
  display: none;
}

.hygiene {
  position: absolute;
  top: 120px;
  left: 127px;
  flex-shrink: 0;
  font-size: 12px;
  display: none;
}

.fun {
  position: absolute;
  top: 120px;
  left: 223px;
  flex-shrink: 0;
  font-size: 12px;
  display: none;
}

.energy {
  position: absolute;
  top: 120px;
  left: 297px;
  flex-shrink: 0;
  font-size: 12px;
  display: none;
}

.map {
  position: absolute;
  top: 689px;
  left: 123px;
  flex-shrink: 0;
  display: none;
}

.v1 {
  position: absolute;
  top: 689px;
  left: 228px;
  flex-shrink: 0;
  display: none;
}

.games {
  position: absolute;
  top: 689px;
  left: 315px;
  flex-shrink: 0;
  display: none;
}

.eggPlaceholder {
  position: absolute;
  top: 410px;
  left: calc(50% - 99.5px);
  width: 199px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  flex-shrink: 0;
}

.petName {
  position: absolute;
  top: 355px;
  left: calc(50% - 50px);
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #000;
  white-space: nowrap;
  flex-shrink: 0;
  z-index: 1;
}

.energyPlaceholder {
  position: absolute;
  top: 84px;
  left: 136px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  display: none;
}

.shakeYourPhone {
  position: absolute;
  top: 180px;
  left: calc(50% - 89.5px);
  font-size: 20px;
  flex-shrink: 0;
  z-index: 1;
}

.groupContainer {
  position: absolute;
  top: 298.84px;
  left: 186.91px;
  width: 63.8px;
  height: 84.2px;
  flex-shrink: 0;
}

.groupChild {
  position: absolute;
  top: 2.83px;
  left: 12.6px;
  width: 51.2px;
  height: 81.3px;
  object-fit: contain;
}

.groupItem {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 51.3px;
  height: 81.4px;
  object-fit: contain;
}

.ecranDarriveItem {
  position: absolute;
  top: 298.84px;
  left: 144px;
  width: 63.8px;
  height: 84.2px;
  object-fit: contain;
  flex-shrink: 0;
}

.rectangleParent {
  position: absolute;
  top: 298.84px;
  left: 177.22px;
  width: 40.1px;
  height: 76.1px;
  flex-shrink: 0;
}

.groupInner {
  position: absolute;
  top: 0px;
  left: 0px;
  border-radius: 5px;
  background-color: #000;
  width: 40.1px;
  height: 76.1px;
}

.rectangleDiv {
  position: absolute;
  top: 1.38px;
  left: 1.38px;
  border-radius: 4px;
  background-color: #fff;
  width: 37.4px;
  height: 73.4px;
}

.ecranDarriveInner {
  position: absolute;
  top: 285px;
  left: 183px;
  width: 29px;
  height: 3px;
  flex-shrink: 0;
}

.polygonIcon {
  position: absolute;
  top: 285px;
  left: 210.44px;
  width: 7.7px;
  height: 7.7px;
  object-fit: contain;
  flex-shrink: 0;
}

.ecranDarriveChild2 {
  position: absolute;
  top: 285px;
  left: 177.22px;
  width: 7.7px;
  height: 7.7px;
  object-fit: contain;
  flex-shrink: 0;
}

.arrowLeft {
  position: absolute;
  top: 760px;
  left: 10px;
  width: 120px;
  height: 120px;
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.arrowRight {
  position: absolute;
  top: 760px;
  right: 10px;
  width: 120px;
  height: 120px;
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.pixilFrame01Parent {
  position: absolute;
  top: calc(50% + 294px);
  left: calc(50% - 93.73px);
  width: 193px;
  height: 193px;
  flex-shrink: 0;
  font-size: 24px;
}

.pixilFrame01Icon {
  position: absolute;
  top: calc(50% - 63.5px);
  left: calc(50% - 69px);
  width: 133px;
  height: 133px;
  object-fit: fill;
}

.rectangle {
  position: absolute;
  top: 74.47px;
  left: 60.84px;
  background-color: #fff;
  width: 57.7px;
  height: 35.7px;
}

.use {
  position: absolute;
  top: 76.57px;
  left: 69.23px;
  display: inline-block;
  width: 46.2px;
  height: 30.4px;
  cursor: pointer;
  transition: transform 0.2s;
}

/* Gauge styles */
.gaugeContainer {
  width: 50px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #000;
  margin-top: 4px;
}

.gauge {
  height: 100%;
  background: linear-gradient(to right, #ff6b6b, #ffd93d, #6bcf7f);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.statValue {
  font-size: 10px;
  font-weight: 600;
  color: #000;
  margin-top: 2px;
}

/* Egg hatching styles */
@keyframes shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
  20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

.hatchedPet {
  width: 150px !important;
  height: 150px !important;
  object-fit: contain;
  animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes popIn {
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
</style>
