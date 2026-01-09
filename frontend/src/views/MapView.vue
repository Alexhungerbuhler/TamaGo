<template>
  <div class="map-view">
    <!-- Permission Modal -->
    <div v-if="showPermissionModal" class="permission-modal-overlay">
      <div class="permission-modal">
        <div class="modal-icon">📍</div>
        <h2>Location Access</h2>
        <p>TamaGo needs your location to display nearby Tamagotchis and explore the map.</p>
        <div class="modal-actions">
          <button @click="requestLocationPermission" class="btn-allow">
            ✓ Allow
          </button>
          <button @click="rejectLocationPermission" class="btn-deny">
            ✗ Deny
          </button>
        </div>
      </div>
    </div>

    <div class="map-container">
      <div v-if="!isWatchingLocation" class="map-placeholder">
        <p v-if="locationError">❌ {{ locationError }}</p>
        <p v-else>📍 Loading map...</p>
      </div>
      <div id="leaflet-map" class="leaflet-map"></div>
    </div>

    <div v-if="currentLocation && isWatchingLocation" class="location-info">
      📍 Current position: {{ currentLocation.latitude.toFixed(6) }}, {{ currentLocation.longitude.toFixed(6) }}
    </div>

    <!-- Online Users List -->
    <div v-if="getOnlineUsersList().length > 0" class="users-list-panel">
      <div class="users-list-header">
        👥 Users Online: {{ getOnlineUsersList().length }}
      </div>
      <div class="users-list-content">
        <div v-for="user in getOnlineUsersList()" :key="user._id" class="user-item" @click="selectedUser = user">
          <div class="user-avatar">👤</div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div v-if="user.location" class="user-coords">
              📍 {{ user.location.coordinates[1].toFixed(4) }}, {{ user.location.coordinates[0].toFixed(4) }}
            </div>
          </div>
          <div class="user-status">🟢</div>
        </div>
      </div>
    </div>

    <div v-if="locationError" class="error">
      ❌ {{ locationError }}
    </div>

    <div class="map-footer">
      <button @click="goBack" class="btn-back">← Back to Tamago</button>
    </div>

    <!-- Pet Detail Modal -->
    <div v-if="selectedPet" class="pet-detail-modal" @click="selectedPet = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedPet.name }}</h3>
        <p>👤 Owner: {{ selectedPet.owner?.name }}</p>
        <p v-if="onlineUsers.has(selectedPet.owner?._id)" class="online-status">🟢 Online</p>
        <p v-else class="offline-status">⚫ Offline</p>
        <button @click="selectedPet = null" class="btn-close">Close</button>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="user-detail-modal" @click="selectedUser = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedUser.name }}</h3>
        <p v-if="selectedUser.location" class="location-detail">
          📍 Location: {{ selectedUser.location.coordinates[1].toFixed(6) }}, 
          {{ selectedUser.location.coordinates[0].toFixed(6) }}
        </p>
        <p class="online-status">🟢 Online</p>
        <button @click="selectedUser = null" class="btn-close">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useNearbyPets, useOnlineUsers } from '../composables/useWebSocket';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import wsService from '../services/websocket';

// Fixer les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const router = useRouter();
const {
  nearbyPets,
  currentLocation,
  isWatchingLocation,
  locationError,
  startWatchingLocation,
  stopWatchingLocation
} = useNearbyPets();

const { onlineUsers, onlineUsersData, getOnlineUsersList } = useOnlineUsers();

const selectedPet = ref(null);
const selectedUser = ref(null);
const map = ref(null);
const userMarker = ref(null);
const petMarkers = ref(new Map());
const userMarkers = ref(new Map());
const showPermissionModal = ref(true);

function requestLocationPermission() {
  showPermissionModal.value = false;
  startTracking();
}

function rejectLocationPermission() {
  showPermissionModal.value = false;
  router.push('/tamago');
}

function startTracking() {
  showPermissionModal.value = false;
  startWatchingLocation(1000);
}

function stopTracking() {
  stopWatchingLocation();
  destroyMap();
}

function goBack() {
  destroyMap();
  stopWatchingLocation();
  router.push('/tamago');
}

function initMap() {
  if (!currentLocation.value) {
    return;
  }

  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) {
    return;
  }

  try {
    map.value = L.map('leaflet-map').setView(
      [currentLocation.value.latitude, currentLocation.value.longitude],
      16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.value);

    setTimeout(() => {
      updateUserMarker();
      updatePetMarkers();
      updateUserMarkers();
      map.value.invalidateSize();
    }, 200);
  } catch (err) {
    // Map initialization error
  }
}

function updateUserMarker() {
  if (!map.value) {
    return;
  }

  if (!currentLocation.value) {
    return;
  }

  if (userMarker.value) {
    map.value.removeLayer(userMarker.value);
  }

  const customIcon = L.divIcon({
    className: 'custom-marker user-position-marker',
    html: '📍',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  userMarker.value = L.marker(
    [currentLocation.value.latitude, currentLocation.value.longitude],
    { icon: customIcon, title: 'Your location' }
  ).addTo(map.value);
}

function updatePetMarkers() {
  if (!map.value) {
    return;
  }

  petMarkers.value.forEach((marker) => {
    map.value.removeLayer(marker);
  });
  petMarkers.value.clear();

  nearbyPets.value.forEach((pet) => {
    if (!pet.location?.coordinates) {
      return;
    }

    const [lng, lat] = pet.location.coordinates;
    const isOnline = onlineUsers.value.has(pet.owner?._id);

    const customIcon = L.divIcon({
      className: `custom-marker pet-marker ${isOnline ? 'online' : 'offline'}`,
      html: isOnline ? '🐣' : '⚪',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const marker = L.marker([lat, lng], { icon: customIcon, title: pet.name })
      .bindPopup(`<strong>${pet.name}</strong><br>Owner: ${pet.owner?.name}<br>Status: ${isOnline ? '🟢 Online' : '⚫ Offline'}`)
      .addTo(map.value);

    marker.on('click', () => {
      selectedPet.value = pet;
    });

    petMarkers.value.set(pet._id, marker);
  });
}

function updateUserMarkers() {
  if (!map.value) {
    return;
  }

  userMarkers.value.forEach((marker) => {
    map.value.removeLayer(marker);
  });
  userMarkers.value.clear();

  const usersList = getOnlineUsersList();

  usersList.forEach((user) => {
    if (!user.location?.coordinates) {
      return;
    }

    const [lng, lat] = user.location.coordinates;

    const customIcon = L.divIcon({
      className: 'custom-marker user-location-marker',
      html: '👤',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const marker = L.marker([lat, lng], { icon: customIcon, title: user.name })
      .bindPopup(`<strong>${user.name}</strong><br>📍 Online<br>Coords: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .addTo(map.value);

    marker.on('click', () => {
      selectedUser.value = user;
    });

    userMarkers.value.set(user._id, marker);
  });
}

function destroyMap() {
  if (map.value) {
    map.value.remove();
    map.value = null;
    petMarkers.value.clear();
    userMarkers.value.clear();
    userMarker.value = null;
  }
}

onMounted(() => {
  showPermissionModal.value = true;
});

onUnmounted(() => {
  destroyMap();
  stopWatchingLocation();
});

watch(
  () => isWatchingLocation.value,
  async (watching) => {
    if (watching && currentLocation.value) {
      await nextTick();
      setTimeout(() => {
        initMap();
      }, 100);
    } else if (!watching) {
      destroyMap();
    }
  }
);

watch(
  () => currentLocation.value,
  (newLocation) => {
    if (isWatchingLocation.value && newLocation && !map.value) {
      setTimeout(() => {
        initMap();
      }, 100);
    } else if (map.value && newLocation) {
      updateUserMarker();
    }
  }
);

watch(
  () => locationError.value,
  (error) => {
    // Location error handled
  }
);

watch(
  () => nearbyPets.value,
  (pets) => {
    if (map.value) {
      updatePetMarkers();
    }
  },
  { deep: true }
);

watch(
  () => onlineUsers.value,
  () => {
    if (map.value) {
      updatePetMarkers();
    }
  }
);

watch(
  () => onlineUsersData.value.size,
  () => {
    if (map.value) {
      updateUserMarkers();
    }
  }
);
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.map-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #fff;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.leaflet-map {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: 'Pixelify Sans', monospace;
  color: #666;
  background: #f5f5f5;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.map-placeholder p {
  font-size: 1.2rem;
}

.location-info {
  background: #f0f9ff;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ddd;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.9rem;
  color: #333;
}

.users-list-panel {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  max-height: 250px;
  overflow-y: auto;
  font-family: 'Pixelify Sans', monospace;
}

.users-list-header {
  padding: 1rem 1.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
}

.users-list-content {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f9f9f9;
}

.user-avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  border-radius: 50%;
  border: 2px solid #f59e0b;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 700;
  color: #000;
  font-size: 0.9rem;
}

.user-coords {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

.user-status {
  font-size: 1rem;
}

.error {
  background: #fee;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #fcc;
  font-family: 'Pixelify Sans', monospace;
  color: #c00;
}

.debug-info {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #0f0;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
  z-index: 1001;
}

.map-footer {
  padding: 1.5rem;
  border-top: 2px solid #e5e5e5;
  background: #fff;
  display: flex;
  justify-content: center;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: #627DE0;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-back:hover {
  background: #5169c7;
}

.marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  background: white;
  border: 2px solid #627DE0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.marker:hover {
  transform: scale(1.15);
}

.custom-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  background: white;
  border: 2px solid #627DE0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer !important;
}

.custom-marker:hover {
  transform: scale(1.15);
}

.user-position-marker {
  background: #e3f2fd;
  border-color: #2563eb;
}

.user-location-marker {
  background: #fef3c7;
  border-color: #f59e0b;
  border-width: 3px;
}

.pet-marker {
  background: white;
  border-color: #999;
}

.pet-marker.online {
  border-color: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.pet-marker.offline {
  border-color: #999;
  opacity: 0.7;
}

.permission-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.permission-modal {
  background: #ffffff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
}

.modal-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  display: block;
}

.permission-modal h2 {
  margin: 0 0 1rem 0;
  color: #000000;
  font-size: 1.5rem;
  font-weight: 700;
}

.permission-modal p {
  margin: 0 0 1.5rem 0;
  color: #666666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-allow,
.btn-deny {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-allow {
  background: #627DE0;
  color: #ffffff;
}

.btn-allow:hover {
  background: #5169c7;
  transform: translateY(-2px);
}

.btn-deny {
  background: #f0f0f0;
  color: #666666;
}

.btn-deny:hover {
  background: #e0e0e0;
}

.pet-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.user-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  font-family: 'Pixelify Sans', monospace;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #000;
  font-size: 1.3rem;
}

.modal-content p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.online-status {
  color: #22c55e !important;
}

.offline-status {
  color: #666 !important;
}

.btn-close {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #627DE0;
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'Pixelify Sans', monospace;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #5169c7;
}

@media (max-width: 768px) {
  .map-footer {
    padding: 1rem;
  }

  .btn-back {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }

  .permission-modal {
    padding: 2rem 1.5rem;
  }

  .marker {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}
</style>
