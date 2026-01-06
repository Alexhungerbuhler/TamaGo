<template>
  <div :class="$style.ecranDarrive">
    <!-- Background cloud element -->
    <img :class="$style.b4de0fe89384581A3938a7a175Icon" src="/background/background.svg" alt="background" />
    
    <!-- Top Stats Icons with Labels -->
    <div :class="$style.topStatsContainer">
      <div 
        v-for="(icon, index) in topIcons"
        :key="index"
        :class="[$style.topStatItem, { [$style.blinking]: selectedIconIndex === index }]"
      >
        <img :class="$style.topIcon" :src="icon.src" :alt="icon.label" :title="icon.label" />
        <b :class="$style.topLabel">{{ icon.label }}</b>
      </div>
    </div>
   
    
    <!-- Bottom Navigation Icons with Labels -->
    <div :class="$style.groupParent">
      <div 
        v-for="(icon, index) in bottomIcons"
        :key="index"
        :class="[$style.navItem, { [$style.blinking]: selectedBottomIndex === index }]"
        @click="icon.action"
      >
        <img :class="$style.navIcon" :src="icon.src" :alt="icon.label" :title="icon.label" />
        <b :class="$style.navLabel">{{ icon.label }}</b>
      </div>
    </div>
    
    <!-- Main content icons (can be replaced with actual images) -->
    <div :class="$style.eggPlaceholder">
        <img src="/Eggs/egg.svg" alt="Egg" title="Egg" />
    </div>
    
    <!-- Instruction text -->
    <b :class="$style.shakeYourPhone">Shake your phone <br/>to hatch the egg</b>

    
    <!-- Phone screen decorations -->
    <img :class="$style.ecranDarriveInner" alt="antenna" />
    <img :class="$style.polygonIcon" alt="corner-decoration-1" />
    <img :class="$style.ecranDarriveChild2" alt="corner-decoration-2" />
    
    <!-- Navigation arrows -->
    <img :class="$style.arrowLeft" src="/Arrows/fleches droite et gauche 2.svg" alt="Left arrow" @click="handleLeftArrow" />
    <img :class="$style.arrowRight" src="/Arrows/fleches droite et gauche 1.svg" alt="Right arrow" @click="handleRightArrow" />
    
    <!-- USE Button -->
    <div :class="$style.pixilFrame01Parent">
      <img :class="$style.pixilFrame01Icon" src="/Arrows/Group 23.svg" alt="button-bg" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const router = useRouter();
const selectedIconIndex = ref(0);

// Navigation functions (defined first so they can be referenced in allIcons)
const goToProfile = () => router.push('/profile');
const goToMap = () => router.push('/map');
const go1v1 = () => router.push('/tamagotchi');
const goToGames = () => router.push('/games');

// All icons in circular navigation order (top then bottom)
const allIcons = ref([
  // Top icons
  { label: 'Hunger', src: '/icons/Group-1.svg', section: 'top' },
  { label: 'Hygiene', src: '/icons/health-stool--Streamline-Pixel.svg', section: 'top' },
  { label: 'Fun', src: '/icons/entertainment-events-hobbies-popcorn.svg', section: 'top' },
  { label: 'Energy', src: '/icons/ecology-clean-battery.svg', section: 'top' },
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

const handleUse = () => {
  console.log('USE button clicked');
  // Add egg hatching logic here
};
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

.arrowLeft:hover {
  transform: scale(1.1);
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

.arrowRight:hover {
  transform: scale(1.1);
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
  top: calc(50% - 96.5px);
  left: calc(50% - 96.5px);
  width: 193px;
  height: 193px;
  object-fit: cover;
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

.use:hover {
  transform: scale(1.05);
}
</style>
