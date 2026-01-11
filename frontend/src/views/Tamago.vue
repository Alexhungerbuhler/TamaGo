<template>
  <div :class="$style.ecranDarrive">
    <!-- Background cloud element -->
    <img :class="$style.b4de0fe89384581A3938a7a175Icon" src="/background/background.svg" alt="background" />
    
    <!-- Top Stats Icons with Labels and Gauges -->
    <div :class="$style.topStatsContainer">
      <div 
        v-for="(icon, index) in topIcons"
        :key="icon.id"
        :class="[$style.topStatItem, { [$style.blinking]: selectedIcon?.id === icon.id }]"
      >
        <div :class="$style.iconWrapper">
          <!-- Jauge colorée en arrière-plan -->
          <img 
            v-if="getStatValue(icon.label) > 0"
            :class="[$style.gaugeIcon, { [$style.gaugeRouge]: getStatValue(icon.label) < 25 }]"
            :src="getGaugeImage(getStatValue(icon.label))"
            :alt="`Gauge for ${icon.label}`"
            :style="getGaugeStyle(getStatValue(icon.label))"
          />
          <!-- Icône principale en noir par dessus -->
          <img 
            :class="$style.topIcon"
            :src="icon.src"
            :alt="icon.label"
          />
        </div>
        <b :class="[$style.topLabel, { [$style.colorGreen]: getStatValue(icon.label) >= 75, [$style.colorOrange]: getStatValue(icon.label) >= 35 && getStatValue(icon.label) < 75, [$style.colorRed]: getStatValue(icon.label) < 35 }]">{{ icon.label }}</b>
      </div>
    </div>
   
    
    <!-- Bottom Navigation Icons with Labels -->
    <div :class="$style.groupParent">
      <div 
        v-for="(icon, index) in bottomIcons"
        :key="icon.id"
        :class="[$style.navItem, { [$style.blinking]: selectedIcon?.id === icon.id }]"
      >
        <img :class="$style.navIcon" :src="icon.src" :alt="icon.label" :title="icon.label" />
        <b :class="$style.navLabel">{{ icon.label }}</b>
      </div>
    </div>
    
    <!-- Main content icons (can be replaced with actual images) -->
    <div :class="$style.eggPlaceholder" @click="handleEggClick" :style="{ transform: `translate(calc(-50% + ${petPositionX}px), calc(-50% + ${petPositionY}px))` }">
      <img v-if="!isHatched" src="/Eggs/egg.svg" alt="Egg" title="Egg" :class="{ [$style.shake]: isShaking }" />
      <!-- Show animation frame if animating, otherwise show normal pet image -->
      <img v-else :src="currentAnimationFrame || hatchedPetImage" alt="Hatched Pet" title="Hatched Pet" :class="$style.hatchedPet" />
    </div>

    <!-- Pet name - shown above hatched pet -->
    <b v-if="isHatched" :class="$style.petName" :style="{ transform: `translate(calc(-50% + ${petPositionX}px), calc(-50% + ${petPositionY}px))` }">{{ currentPet?.name || 'Tamagotchi' }}</b>
    
    <!-- Crottes / Poops - displayed based on hygiene level -->
    <img
      v-for="(poop, index) in poopsPositions"
      :key="`poop-${index}`"
      :class="$style.poop"
      :style="{ left: poop.x + 'px', top: poop.y + 'px' }"
      src="/icons/poop.png"
      alt="poop"
    />
    
    <!-- Instruction text -->
    <b :class="$style.shakeYourPhone">
      <span v-if="!isHatched">
        Shake your phone<br/>{{ shakeCount }}/{{ shakesNeeded }} times
      </span>
      <img v-if="!isHatched" src="/icons/ShakeIcon.svg" alt="Shake icon" :class="$style.shakeIcon" />
      <button 
        v-if="!isHatched && needsPermission && !permissionGranted" 
        @click="requestMotionPermission"
        :class="$style.permissionButton"
      >
        🔓 Enable Shake
      </button>
    </b>
    
    <!-- Navigation arrows -->
    <img :class="$style.arrowLeft" src="/Arrows/fleches droite et gauche 2.svg" alt="Left arrow" @click="handleLeftArrow" />
    <img :class="$style.arrowRight" src="/Arrows/fleches droite et gauche 1.svg" alt="Right arrow" @click="handleRightArrow" />
    
    <!-- USE Button -->
    <div :class="$style.pixilFrame01Parent" @click="handleUse">
      <img :class="$style.pixilFrame01Icon" src="/Arrows/Group 23.svg" alt="button-bg" />
    </div>
    
    <!-- Name Pet Modal -->
    <NamePetModal 
      :isOpen="showNamePetModal" 
      @submit="handlePetNameSubmit"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, watch } from 'vue';
import { usePetsStore } from '../store/pets';
import { useAuthStore } from '../store/index';
import NamePetModal from '../components/NamePetModal.vue';
import wsService from '../services/websocket';

const router = useRouter();
const petsStore = usePetsStore();
const authStore = useAuthStore();
const selectedIconIndex = ref(0);
const currentPet = computed(() => petsStore.currentPet);

// Modal state
const showNamePetModal = ref(false);

// Permission state for iOS
const needsPermission = ref(false);
const permissionGranted = ref(false);

// Egg hatching system
const clickCount = ref(0);
const clicksNeeded = 5; // Number of clicks to hatch
const isHatched = ref(false);
const hatchedPetImage = ref('');
const isShaking = ref(false);

// Pet movement system
const petPositionX = ref(0); // Position in pixels (-100 to 100)
const petPositionY = ref(0); 
const petMovementInterval = ref(null);

// Animation system - for eating and other pet actions
const isAnimating = ref(false);
const currentAnimationFrame = ref(null);

// Animation frames mapping for each pet type
const animationFrames = {
  '/Pets/buisson 1.png': ['/animations/buisson/frame1.png', '/animations/buisson/frame2.png'],
  '/Pets/chatFeu 1.png': ['/animations/chatfeu/frame1.png', '/animations/chatfeu/frame2.png'],
  '/Pets/goute 1.png': ['/animations/goute/frame1.png', '/animations/goute/frame2.png'],
  '/Pets/jspcestquoi.png': ['/animations/jspquoi/frame1.png', '/animations/jspquoi/frame2.png'],
  '/Pets/raichu.png': ['/animations/raichu/frame1.png', '/animations/raichu/frame2.png'],
  '/Pets/renarddelumiere 1.png': ['/animations/renard/frame1.png', '/animations/renard/frame2.png'],
  '/Pets/tortuepierre 1.png': ['/animations/tortuepierre/frame1.png', '/animations/tortuepierre/frame2.png']
};

// Play animation based on pet type
const playAnimation = async (petImage) => {
  const frames = animationFrames[petImage];
  
  // Only play animation if frames exist for this pet
  if (!frames || frames.length === 0) {
    console.log('No animation frames for pet:', petImage);
    return;
  }
  
  isAnimating.value = true;
  console.log('Starting animation for pet:', petImage, 'with', frames.length, 'frames');
  
  try {
    // Cycle through frames 3 times to make animation visible
    for (let cycle = 0; cycle < 3; cycle++) {
      for (const frame of frames) {
        currentAnimationFrame.value = frame;
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms per frame
      }
    }
  } finally {
    // Return to normal pet image
    currentAnimationFrame.value = null;
    isAnimating.value = false;
    console.log('Animation finished');
  }
};

// Poop system - based on hygiene level (apparaissent automatiquement avec la diminution)
const nbPoops = computed(() => {
  if (!currentPet.value || !isHatched.value) return 0;
  const hygiene = currentPet.value.hygiene || 0;
  
  // Paliers exacts basés sur les états de la jauge
  // Les poops disparaissent complètement quand hygiene >= 76 (vert)
  if (hygiene > 75) return 0;      // Vert (100-76%) - Aucun poop
  if (hygiene > 50) return 1;      // Jaune (75-51%)
  if (hygiene > 25) return 2;      // Orange (50-26%)
  if (hygiene > 0) return 3;       // Rouge (25-1%)
  return 4;                        // Critique (0%)
});

// Watcher pour détecter l'apparition d'un poop et incrémenter le compteur
watch(nbPoops, async (newCount, oldCount) => {
  // Incrémenter seulement si le nombre de poops augmente (pas quand ils diminuent)
  if (newCount > oldCount && currentPet.value?._id) {
    try {
      await petsStore.incrementPoops(currentPet.value._id);
      console.log('💩 Poop counter incremented! Total:', newCount);
    } catch (error) {
      console.error('Error incrementing poop counter:', error);
    }
  }
});

const poopsPositions = computed(() => {
  const positions = [];
  const count = nbPoops.value;
  
  // Générer des positions aléatoires fixes pour chaque niveau d'hygiène
  // On utilise le niveau d'hygiène comme seed pour garder les positions cohérentes
  const hygiene = currentPet.value?.hygiene || 100;
  const seed = Math.floor(hygiene / 25); // 0-4 basé sur l'hygiène
  
  for (let i = 0; i < count; i++) {
    // Positions pseudo-aléatoires mais cohérentes autour du pet
    const angle = (seed * 1000 + i * 137.5) % 360; // Angle en degrés
    const radius = 40 + (i * 25) + ((seed * 17 + i * 23) % 40);
    
    // Centrer autour de la position du pet (62% de l'écran)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.62;
    
    const x = centerX + Math.cos(angle * Math.PI / 180) * radius - 20; // -20 pour centrer l'icone
    const y = centerY + Math.sin(angle * Math.PI / 180) * radius - 20;
    
    positions.push({ x, y });
  }
  
  return positions;
});

// Start random pet movement (calm and slow, like walking)
const startPetMovement = () => {
  if (petMovementInterval.value) {
    clearInterval(petMovementInterval.value);
  }
  
  petMovementInterval.value = setInterval(() => {
    if (isHatched.value) {
      // Generate small random movement between -40 and 40 pixels (stay in bottom area)
      const randomMovementX = Math.random() * 80 - 40; // -40 to 40
      const randomMovementY = Math.random() * 40 - 20; // -20 to 20 (smaller vertical movement)
      petPositionY.value = randomMovementY;
      petPositionX.value = randomMovementX;
    }
  }, 3000); // Change position every 3 seconds (slower)
};

// Stop pet movement
const stopPetMovement = () => {
  if (petMovementInterval.value) {
    clearInterval(petMovementInterval.value);
    petMovementInterval.value = null;
  }
};
// Available pet images for hatching
const availablePets = [
  '/Pets/buisson 1.png',
  '/Pets/chatFeu 1.png',
  '/Pets/goute 1.png',
  '/Pets/jspcestquoi.png',
  '/Pets/raichu.png',
  '/Pets/renarddelumiere 1.png',
  '/Pets/tortuepierre 1.png'
];

// Get random pet image
const getRandomPet = () => {
  return availablePets[Math.floor(Math.random() * availablePets.length)];
};

// Load hatched pet from localStorage if it exists
const loadHatchedPet = (petId) => {
  if (!petId) return;
  
  const saved = localStorage.getItem(`hatched_pet_image_${petId}`);
  if (saved) {
    isHatched.value = true;
    hatchedPetImage.value = saved;
    clickCount.value = clicksNeeded; // Mark as hatched
    console.log('Loaded hatched pet for ID', petId, ':', hatchedPetImage.value);
    // Start movement for loaded pet
    startPetMovement();
  }
};

// Save hatched pet to localStorage
const saveHatchedPet = (petId) => {
  if (!petId) return;
  localStorage.setItem(`hatched_pet_image_${petId}`, hatchedPetImage.value);
};

// Handle egg click - DISABLED (shake only)
const handleEggClick = () => {
  // Clics désactivés - utiliser le shake du téléphone
  return;
};

// Hatch the egg
const hatchEgg = async () => {
  console.log('[hatchEgg] Starting egg hatching process...');
  isHatched.value = true;
  hatchedPetImage.value = getRandomPet();
  console.log('[hatchEgg] Egg hatched! Pet image:', hatchedPetImage.value);
  
  // Check if user already has a pet
  try {
    const userId = authStore.user?.id;
    console.log('[hatchEgg] User ID:', userId);
    if (!userId) {
      console.error('[hatchEgg] Cannot create pet: No user ID');
      return;
    }
    
    // Check if we already have a pet
    console.log('[hatchEgg] Checking for existing pets...');
    await petsStore.fetchPets({ limit: 1, userId });
    console.log('[hatchEgg] Pets found:', petsStore.petsList.length);
    
    if (petsStore.petsList.length === 0) {
      // No pet exists, show name modal
      console.log('[hatchEgg] No pet found, showing name modal...');
      showNamePetModal.value = true;
    } else {
      // Pet already exists, just load it
      console.log('[hatchEgg] Pet already exists, loading:', petsStore.petsList[0]);
      const existingPet = petsStore.petsList[0];
      
      // Charger l'image sauvegardée ou en générer une nouvelle
      const savedImage = localStorage.getItem(`hatched_pet_image_${existingPet._id}`);
      if (savedImage) {
        hatchedPetImage.value = savedImage;
      } else {
        hatchedPetImage.value = getRandomPet();
        saveHatchedPet(existingPet._id);
      }
      
      await petsStore.fetchPet(existingPet._id);
      console.log('[hatchEgg] Current pet after fetch:', petsStore.currentPet);
      
      // Start pet movement for existing pet
      startPetMovement();
    }
  } catch (error) {
    console.error('[hatchEgg] Error checking for existing pet:', error);
  }
  
  console.log('[hatchEgg] Egg hatching process complete!');
};

// Handle pet name submission from modal
const handlePetNameSubmit = async (petName) => {
  console.log('[handlePetNameSubmit] Creating pet with name:', petName);
  
  try {
    // Create the pet with the given name
    const newPet = await petsStore.createPet({
      name: petName,
      lat: 0,
      lng: 0
    });
    console.log('[handlePetNameSubmit] Pet created successfully:', newPet);
    
    // Save the hatched pet image with pet ID
    saveHatchedPet(newPet._id);
    
    // Load the newly created pet
    console.log('[handlePetNameSubmit] Loading newly created pet...');
    await petsStore.fetchPet(newPet._id);
    console.log('[handlePetNameSubmit] Current pet after fetch:', petsStore.currentPet);
    
    // Close the modal
    showNamePetModal.value = false;
    
    // Start pet movement
    console.log('[handlePetNameSubmit] Starting pet movement...');
    startPetMovement();
    console.log('[handlePetNameSubmit] Pet creation complete!');
  } catch (error) {
    console.error('[handlePetNameSubmit] Error creating pet:', error);
    // Keep modal open on error so user can try again
  }
};

// Reset egg (for testing or to hatch again)
const resetEgg = () => {
  isHatched.value = false;
  hatchedPetImage.value = '';
  clickCount.value = 0;
  petPositionX.value = 0;
  petPositionY.value = 0;
  localStorage.removeItem('hatched_pet_image');
  stopPetMovement();
};

// Device shake detection for mobile
const shakeCount = ref(0);
const shakesNeeded = 5;

const handleDeviceShake = () => {
  if (isHatched.value) return;
  
  shakeCount.value++;
  isShaking.value = true;
  console.log(`Device shaken! ${shakeCount.value}/${shakesNeeded}`);
  
  // Reset shake animation after a short delay
  setTimeout(() => {
    isShaking.value = false;
  }, 300);
  
  // Check if enough shakes to hatch
  if (shakeCount.value >= shakesNeeded) {
    hatchEgg();
  }
};

// Navigation functions (defined first so they can be referenced in allIcons)
const goToProfile = () => {
  console.log('Navigating to Profile');
  router.push('/profile');
};
const goToMap = () => {
  console.log('Navigating to Map');
  router.push('/map');
};
const go1v1 = () => {
  console.log('Navigating to 1v1');
  router.push('/tamagotchi');
};
const goToGames = () => {
  console.log('Navigating to Games');
  router.push('/games');
};
const goToExit = () => {
  console.log('Navigating to Dashboard');
  router.push('/dashboard');
};

// All icons in circular navigation order (top then bottom)
const allIcons = ref([
  // Top icons (stat actions)
  { id: 0, label: 'Hunger', src: '/icons/Group-1.svg', section: 'top', key: 'hunger' },
  { id: 1, label: 'Hygiene', src: '/icons/health-stool--Streamline-Pixel.svg', section: 'top', key: 'hygiene' },
  { id: 2, label: 'Fun', src: '/icons/entertainment-events-hobbies-popcorn.svg', section: 'top', key: 'fun' },
  { id: 3, label: 'Energy', src: '/icons/EnergyIcon.svg', section: 'top', key: 'energy' },
  // Bottom icons (navigation)
  { id: 4, label: 'Map', src: '/icons/interface-essential-global-public--Streamline-Pixel.svg', section: 'bottom', navFunc: goToMap },
  { id: 5, label: 'Games', src: '/icons/entertainment-events-hobbies-game-machines-arcade-1--Streamline-Pixel.svg', section: 'bottom', navFunc: goToGames },
  { id: 6, label: 'Profile', src: '/icons/Group.svg', section: 'bottom', navFunc: goToProfile },
  { id: 7, label: 'Exit', src: '/icons/HomeIcon.svg', section: 'bottom', navFunc: goToExit }
]);

// Top icons list (derived from allIcons)
const topIcons = computed(() => allIcons.value.filter(icon => icon.section === 'top'));

// Bottom icons list (derived from allIcons)
const bottomIcons = computed(() => allIcons.value.filter(icon => icon.section === 'bottom'));

// Get selected icon by ID
const selectedIcon = computed(() => {
  return allIcons.value.find(icon => icon.id === selectedIconIndex.value) || allIcons.value[0];
});

// Get selected icon index in each section
const selectedTopIndex = computed(() => {
  const icon = selectedIcon.value;
  return icon?.section === 'top' ? topIcons.value.findIndex(i => i.id === icon.id) : -1;
});

const selectedBottomIndex = computed(() => {
  const icon = selectedIcon.value;
  return icon?.section === 'bottom' ? bottomIcons.value.findIndex(i => i.id === icon.id) : -1;
});

// Handle left arrow - go left (previous icon in circular loop)
const handleLeftArrow = () => {
  selectedIconIndex.value = (selectedIconIndex.value - 1 + 8) % 8;
};

// Handle right arrow - go right (next icon in circular loop)
const handleRightArrow = () => {
  selectedIconIndex.value = (selectedIconIndex.value + 1) % 8;
};

// Get stat value for a given stat name
const getStatValue = (statName) => {
  if (!currentPet.value) return 0;
  
  const statKey = statName.toLowerCase();
  const value = currentPet.value[statKey] || 0;
  
  // Ensure value is between 0 and 100
  return Math.max(0, Math.min(100, value));
};

// Get stat color based on value
const getStatColor = (value) => {
  if (value >= 75) return '#6bcf7f'; // Green
  if (value >= 35) return '#ffd93d'; // Orange
  return '#ff6b6b'; // Red
};

// Get gauge image based on stat value
const getGaugeImage = (value) => {
  if (value === 100) return '/icons/Icon_JaugeVerte.svg'; // Green for 100
  if (value >= 75) return '/icons/Icon_JaugeJaune.svg'; // Yellow for 75-99
  if (value >= 50) return '/icons/Icon_JaugeOrange.svg'; // Orange for 50-74
  return '/icons/Icon_JaugeRouge.svg'; // Red for 0-49
};

// Get gauge style based on stat value (Orange est la référence parfaite)
const getGaugeStyle = (value) => {
  // Jauge Rouge (0-49)
  if (value < 50) {
    return { 
      width: '60px', 
      height: '30px', 
      position: 'absolute', 
      top: '20%',
      left: '20%',
      transform: 'translate(-50%, -50%)' 
    };
  }
  
  // Jauge Orange (50-74)
  if (value >= 50 && value < 75) {
    return { 
      width: '60px', 
      height: '60px', 
      position: 'absolute', 
      top: '50%',
      left: '20%',
      transform: 'translate(-50%, -50%)' 
    };
  }
  
  // Jauge Jaune (75-99)
  if (value >= 75 && value < 100) {
    return { 
      width: '60px', 
      height: '60px', 
      position: 'absolute', 
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)' 
    };
  }
  
  // Jauge Verte (100)
  return { 
    width: '60px', 
    height: '60px', 
    position: 'absolute', 
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)' 
  };
};

// Handle USE button - execute pet action based on currently selected icon
const handleUse = async () => {
  const icon = selectedIcon.value;
  
  if (!icon) {
    console.log('No icon selected');
    return;
  }
  
  console.log('USE button pressed for:', icon.label);
  console.log('Icon section:', icon.section);
  console.log('Current pet:', currentPet.value);
  console.log('Current pet ID:', currentPet.value?._id);
  
  // For navigation icons, execute the navigation function
  if (icon.section === 'bottom' && icon.navFunc) {
    console.log('Executing navigation for:', icon.label);
    icon.navFunc();
    return;
  }
  
  // For stat icons, execute pet action
  if (icon.section === 'top' && currentPet.value?._id) {
    try {
      const petId = currentPet.value._id;
      
      console.log('Before action - Current stats:', {
        hunger: currentPet.value.hunger,
        hygiene: currentPet.value.hygiene,
        energy: currentPet.value.energy,
        fun: currentPet.value.fun
      });
      
      let result;
      switch(icon.key) {
        case 'hunger':
          console.log('Executing hunger action');
          result = await petsStore.feedPet(petId);
          console.log('Feed result:', result);
          // Play eating animation
          if (hatchedPetImage.value) {
            await playAnimation(hatchedPetImage.value);
          }
          break;
        case 'hygiene':
          console.log('Executing hygiene action');
          result = await petsStore.toiletPet(petId);
          console.log('Toilet result:', result);
          break;
        case 'fun':
          // Fun ne peut augmenter QUE via les games, pas ici
          console.log('Fun can only increase by playing games!');
          return; // Sortir sans action
        case 'energy':
          // Energy se recharge automatiquement après 5 minutes
          console.log('Energy recharges automatically after 5 minutes!');
          return; // Sortir sans action
      }
      
      // Refresh pet data to update gauges
      await petsStore.fetchPet(petId);
      
      console.log('After refresh - Current stats:', {
        hunger: currentPet.value.hunger,
        hygiene: currentPet.value.hygiene,
        energy: currentPet.value.energy,
        fun: currentPet.value.fun
      });
      
      // Force reactivity update by triggering a re-render
      // This is a workaround for Pinia reactivity issues
      selectedIconIndex.value = selectedIconIndex.value;
      
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
    }
  }
};

// Fetch the first pet's data on component mount
onMounted(async () => {
  try {
    console.log('=== Tamago onMounted ===');
    
    // Initialize WebSocket connection
    const token = localStorage.getItem('tamago_auth_token');
    if (token && !wsService.connected) {
      console.log('🔌 Initializing WebSocket connection...');
      wsService.connect(token);
    }
    
    console.log('AuthStore state:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      token: authStore.token ? 'exists' : 'missing'
    });
    
    // Vérifier que l'utilisateur est connecté
    if (!authStore.isAuthenticated) {
      console.error('User not authenticated');
      router.push('/login');
      return;
    }
    
    const userId = authStore.user?.id;
    console.log('User ID extracted:', userId);
    
    if (!userId) {
      console.error('No user ID found. User data:', authStore.user);
      console.error('Attempting to restore auth from localStorage...');
      
      // Essayer de restaurer l'authentification
      const savedUser = localStorage.getItem('tamago_user');
      const savedToken = localStorage.getItem('tamago_auth_token');
      console.log('Saved user from localStorage:', savedUser);
      console.log('Saved token from localStorage:', savedToken ? 'exists' : 'missing');
      
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Parsed user:', parsedUser);
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
      
      // Si toujours pas d'ID, rediriger vers login
      if (!authStore.user?.id) {
        console.error('Cannot retrieve user ID - redirecting to login');
        router.push('/login');
        return;
      }
    }
    
    console.log('Fetching pets for user:', userId);
    await petsStore.fetchPets({ limit: 1, userId });
    console.log('Pets list:', petsStore.petsList);
    
    if (petsStore.petsList.length > 0) {
      // L'utilisateur a déjà un tamagotchi, le charger
      console.log('Loading existing pet:', petsStore.petsList[0]);
      const existingPet = petsStore.petsList[0];
      await petsStore.fetchPet(existingPet._id);
      console.log('Current pet loaded:', petsStore.currentPet);
      
      // Charger l'image sauvegardée ou en générer une nouvelle
      const savedImage = localStorage.getItem(`hatched_pet_image_${existingPet._id}`);
      if (savedImage) {
        hatchedPetImage.value = savedImage;
        console.log('Loaded saved pet image:', savedImage);
      } else {
        hatchedPetImage.value = getRandomPet();
        saveHatchedPet(existingPet._id);
        console.log('Generated new pet image:', hatchedPetImage.value);
      }
      
      // Marquer l'œuf comme éclos et afficher le pet
      isHatched.value = true;
      startPetMovement();
    } else {
      // Nouveau joueur ou incohérence entre localStorage et DB
      console.log('No pets in database');
      
      // Nettoyer le localStorage au cas où il y aurait une incohérence
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('hatched_pet_image_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Réinitialiser l'état
      isHatched.value = false;
      hatchedPetImage.value = '';
      clickCount.value = 0;
      
      console.log('New player - showing egg to hatch');
    }
  } catch (error) {
    console.error('Erreur lors du chargement du pet:', error);
  }
  
  // NE PAS charger hatched pet depuis localStorage ici
  // car on vient de gérer l'état ci-dessus
  // loadHatchedPet();
});

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

// Initialize motion sensor on mount
onMounted(() => {
  
  // Check if permission is needed (iOS 13+)
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    needsPermission.value = true;
    console.log('iOS detected - permission required for motion');
  } else {
    // For Android and older iOS - start immediately
    window.addEventListener('devicemotion', onDeviceMotion);
    permissionGranted.value = true;
    console.log('Motion sensor started (Android/older iOS)');
  }
  
  // Cleanup
  return () => {
    window.removeEventListener('devicemotion', onDeviceMotion);
    stopPetMovement();
  };
});

// Function to request motion permission (iOS)
const requestMotionPermission = async () => {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        permissionGranted.value = true;
        window.addEventListener('devicemotion', onDeviceMotion);
        console.log('✅ Motion permission granted');
      } else {
        console.warn('⚠️ Motion permission denied');
      }
    } catch (error) {
      console.error('Error requesting motion permission:', error);
    }
  }
};
</script>

<style module>
.ecranDarrive {
  width: 100%;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile browsers */
  position: fixed;
  top: 0;
  left: 0;
  background-color: #c0fe90;
  overflow: hidden;
  text-align: left;
  font-size: 14px;
  color: #000;
  font-family: 'Pixelify Sans';
  touch-action: none; /* Prevent pull-to-refresh and other gestures */
}

.b4de0fe89384581A3938a7a175Icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  flex-shrink: 0;
  z-index: 0;
  pointer-events: none;
}

.topIcon {
  position: absolute;
  width: clamp(32px, 8vw, 40px);
  height: clamp(32px, 8vw, 40px);
  flex-shrink: 0;
  object-fit: contain;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.gaugeIcon {
  position: absolute;
  width: clamp(60px, 15vw, 75px);
  height: clamp(60px, 15vw, 75px);
  flex-shrink: 0;
  object-fit: fill;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.gaugeRouge {
  width: 60px !important;
  height: 60px !important;
  max-width: 60px !important;
  max-height: 60px !important;
  min-width: 60px !important;
  min-height: 60px !important;
  object-fit: contain !important;
  scale: 0.65;
}

.topIcon[data-icon="/icons/Group-1.svg"] {
  -webkit-mask-image: url('/icons/Group-1.svg');
  mask-image: url('/icons/Group-1.svg');
}

.topIcon[data-icon="/icons/health-stool--Streamline-Pixel.svg"] {
  -webkit-mask-image: url('/icons/health-stool--Streamline-Pixel.svg');
  mask-image: url('/icons/health-stool--Streamline-Pixel.svg');
}

.topIcon[data-icon="/icons/entertainment-events-hobbies-popcorn.svg"] {
  -webkit-mask-image: url('/icons/entertainment-events-hobbies-popcorn.svg');
  mask-image: url('/icons/entertainment-events-hobbies-popcorn.svg');
}

.topIcon[data-icon="/icons/ecology-clean-battery.svg"] {
  -webkit-mask-image: url('/icons/ecology-clean-battery.svg');
  mask-image: url('/icons/ecology-clean-battery.svg');
}

.topIcon {
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.iconWrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(48px, 12vw, 60px);
  height: clamp(48px, 12vw, 60px);
}

.topStatsContainer {
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(35px, 12vw, 65px);
  flex-shrink: 0;
  z-index: 10;
  width: 90%;
  max-width: 400px;
}

.topStatItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  pointer-events: none;
}

.topLabel {
  font-size: clamp(10px, 2.5vw, 12px);
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

.blinking .topIcon {
  animation: blink 1.2s ease-in-out infinite;
}

.blinking .navIcon {
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
  bottom: 20vh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(45px, 15vw, 75px);
  flex-shrink: 0;
  z-index: 10;
  width: 90%;
  max-width: 400px;
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.navIcon {
  height: clamp(32px, 8vw, 40px);
  width: clamp(32px, 8vw, 40px);
  position: relative;
  object-fit: contain;
}

.navLabel {
  font-size: clamp(10px, 2.5vw, 12px);
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
  top: 55%;
  left: 50%;
  width: clamp(280px, 70vw, 400px);
  height: clamp(280px, 70vw, 400px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  flex-shrink: 0;
  z-index: 5;
}

.petName {
  position: absolute;
  top: calc(50% - 5vh);
  left: 50%;
  font-size: clamp(18px, 5vw, 24px);
  font-weight: 700;
  text-align: center;
  color: #000;
  white-space: nowrap;
  flex-shrink: 0;
  z-index: 6;
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
  top: 20vh;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(16px, 4vw, 20px);
  flex-shrink: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 90%;
  text-align: center;
}

.shakeIcon {
  width: clamp(80px, 20vw, 120px);
  height: clamp(80px, 20vw, 120px);
  margin-top: 10px;
  object-fit: contain;
}

.permissionButton {
  margin-top: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6bcf7f 0%, #5ab36b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(107, 207, 127, 0.3);
  transition: all 0.2s;
}

.permissionButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 207, 127, 0.4);
}

.permissionButton:active {
  transform: translateY(0);
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
  bottom: 6vh;
  left: 50%;
  transform: translateX(calc(-100% - 80px));
  width: clamp(100px, 26vw, 140px);
  height: clamp(100px, 26vw, 140px);
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
  z-index: 10;
  touch-action: manipulation;
}

.arrowRight {
  position: absolute;
  bottom: 6vh;
  right: 50%;
  transform: translateX(calc(100% + 80px));
  width: clamp(100px, 26vw, 140px);
  height: clamp(100px, 26vw, 140px);
  object-fit: contain;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s;
  z-index: 10;
  touch-action: manipulation;
}

/* Poop styling */
.poop {
  position: fixed;
  width: 40px;
  height: 40px;
  z-index: 5;
  animation: poopAppear 0.3s ease-in-out;
  pointer-events: none;
  user-select: none;
  image-rendering: pixelated;
  object-fit: contain;
}

@keyframes poopAppear {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.pixilFrame01Parent {
  position: absolute;
  bottom: 6vh;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(110px, 28vw, 150px);
  height: clamp(110px, 28vw, 150px);
  flex-shrink: 0;
  font-size: clamp(18px, 5vw, 24px);
  cursor: pointer;
  z-index: 10;
  touch-action: manipulation;
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

/* Icon color styles */

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
  width: 100% !important;
  height: 100% !important;
  max-width: clamp(330px, 75vw, 500px) !important;
  max-height: clamp(330px, 75vw, 500px) !important;
  object-fit: contain !important;
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
