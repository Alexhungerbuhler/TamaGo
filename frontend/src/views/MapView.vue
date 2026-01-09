<template>
  <div class="map-view">
    <!-- Modale permission géolocalisation -->
    <div v-if="showPermissionModal" class="permission-modal-overlay">
      <div class="permission-modal">
        <div class="modal-icon">📍</div>
        <h2>Accès à votre localisation</h2>
        <p>TamaGo a besoin de votre localisation pour afficher les Tamagotchis à proximité et explorer la carte.</p>
        <div class="modal-actions">
          <button @click="requestLocationPermission" class="btn-allow">
            ✓ Autoriser
          </button>
          <button @click="rejectLocationPermission" class="btn-deny">
            ✗ Refuser
          </button>
        </div>
      </div>
    </div>

    <div class="map-container">
      <div v-if="!isWatchingLocation" class="map-placeholder">
        <p v-if="locationError">❌ {{ locationError }}</p>
        <p v-else>📍 Chargement de la carte...</p>
      </div>
      
      <div v-else style="width: 100%; height: 100%; display: flex;">
        <!-- Carte Leaflet -->
        <div id="leaflet-map" class="leaflet-map"></div>
      </div>
    </div>

    <div v-if="currentLocation && isWatchingLocation" class="location-info">
      📍 Position actuelle: {{ currentLocation.latitude.toFixed(6) }}, {{ currentLocation.longitude.toFixed(6) }}
    </div>

    <div v-if="locationError" class="error">
      ❌ {{ locationError }}
    </div>

    <div class="map-footer">
      <button @click="goBack" class="btn-back">← Retour à Tamago</button>
    </div>

    <!-- Modal détail pet -->
    <div v-if="selectedPet" class="pet-detail-modal" @click="selectedPet = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedPet.name }}</h3>
        <p>👤 Propriétaire: {{ selectedPet.owner?.name }}</p>
        <p v-if="onlineUsers.has(selectedPet.owner?._id)" class="online-status">🟢 En ligne</p>
        <p v-else class="offline-status">⚫ Hors ligne</p>
        <button @click="selectedPet = null" class="btn-close">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useNearbyPets, useOnlineUsers } from '../composables/useWebSocket';
import { useRouter } from 'vue-router';
import L from 'leaflet';

const router = useRouter();
const {
  nearbyPets,
  currentLocation,
  isWatchingLocation,
  locationError,
  startWatchingLocation,
  stopWatchingLocation
} = useNearbyPets();

const { onlineUsers, isUserOnline } = useOnlineUsers();

const selectedPet = ref(null);
const map = ref(null);
const userMarker = ref(null);
const petMarkers = ref(new Map());
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
  startWatchingLocation(1000); // 1km de rayon
}

function stopTracking() {
  stopWatchingLocation();
  destroyMap();
}

function goBack() {
  // Nettoyer la carte et la géolocalisation
  destroyMap();
  stopWatchingLocation();
  // Naviguer vers Tamago sans confirmation
  router.push('/tamago');
}

function selectPet(pet) {
  selectedPet.value = pet;
}

function calculateDistance(location) {
  if (!currentLocation.value || !location?.coordinates) return '?';
  
  const [lng, lat] = location.coordinates;
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = currentLocation.value.latitude * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  const Δφ = (lat - currentLocation.value.latitude) * Math.PI / 180;
  const Δλ = (lng - currentLocation.value.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c;
  return Math.round(distance);
}

function initMap() {
  if (!currentLocation.value) return;
  
  // Détruire la carte existante
  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  // Créer une nouvelle carte
  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) {
    console.error('Leaflet map element not found');
    return;
  }

  try {
    // Créer un renderer canvas explicite
    const canvasRenderer = L.canvas({ padding: 0.5 });

    map.value = L.map('leaflet-map', {
      preferCanvas: true,
      renderer: canvasRenderer,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      wheelPxPerZoomLevel: 60,
      doubleClickZoom: true
    }).setView(
      [currentLocation.value.latitude, currentLocation.value.longitude],
      16
    );

    // Ajouter les tuiles OpenStreetMap avec options optimisées
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 1,
      tileSize: 256,
      keepBuffer: 2,
      className: 'leaflet-tile-canvas'
    }).addTo(map.value);

    // Invalider la taille pour forcer Leaflet à recalculer
    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize();
        // Recentrer après resize
        map.value.setView([currentLocation.value.latitude, currentLocation.value.longitude], 16);
      }
    }, 100);

    // Ajouter le marqueur de l'utilisateur
    updateUserMarker();
    
    // Ajouter les marqueurs des pets
    updatePetMarkers();

    console.log('Carte initialisée:', currentLocation.value);
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la carte:', err);
  }
}

function updateUserMarker() {
  if (!map.value || !currentLocation.value) return;

  if (userMarker.value) {
    userMarker.value.setLatLng([currentLocation.value.latitude, currentLocation.value.longitude]);
  } else {
    // Créer un marqueur bleu pour l'utilisateur
    userMarker.value = L.circleMarker(
      [currentLocation.value.latitude, currentLocation.value.longitude],
      {
        radius: 8,
        fillColor: '#2563eb',
        color: '#1d4ed8',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        renderer: map.value.options.renderer
      }
    ).addTo(map.value);

    userMarker.value.bindPopup('<b>📍 Votre position</b>');
  }

  map.value.setView([currentLocation.value.latitude, currentLocation.value.longitude], 16);
}

function updatePetMarkers() {
  if (!map.value) return;

  // Supprimer les anciens marqueurs
  petMarkers.value.forEach((marker) => {
    map.value.removeLayer(marker);
  });
  petMarkers.value.clear();

  // Ajouter les nouveaux marqueurs pour chaque pet
  nearbyPets.value.forEach((pet) => {
    if (!pet.location?.coordinates) return;

    const [lng, lat] = pet.location.coordinates;
    const isOnline = onlineUsers.value.has(pet.owner?._id);

    const markerColor = isOnline ? '#ef4444' : '#999';

    const marker = L.circleMarker([lat, lng], {
      radius: 6,
      fillColor: markerColor,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
      renderer: map.value.options.renderer
    }).addTo(map.value);

    marker.bindPopup(`
      <div class="marker-popup">
        <b>🐣 ${pet.name}</b><br>
        <small>👤 ${pet.owner?.name || 'Inconnu'}</small><br>
        <small>${isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}</small>
      </div>
    `);

    petMarkers.value.set(pet._id, marker);
  });
}

function destroyMap() {
  if (map.value) {
    map.value.remove();
    map.value = null;
    petMarkers.value.clear();
    userMarker.value = null;
  }
}

onMounted(() => {
  console.log('MapView montée');
  // Afficher la modale de permission - ne pas démarrer automatiquement
  showPermissionModal.value = true;
});

onUnmounted(() => {
  destroyMap();
  stopWatchingLocation();
  console.log('MapView démontée');
});

// Observer les changements de localisation
watch(
  () => currentLocation.value,
  (newLocation) => {
    if (newLocation && isWatchingLocation.value) {
      if (!map.value) {
        initMap();
      } else {
        updateUserMarker();
      }
    }
  },
  { deep: true }
);

// Observer les changements de pets à proximité
watch(
  () => nearbyPets.value,
  () => {
    if (map.value) {
      updatePetMarkers();
    }
  },
  { deep: true }
);

// Observer les changements de statut en ligne
watch(
  () => onlineUsers.value,
  () => {
    if (map.value) {
      updatePetMarkers();
    }
  }
);

// Initialiser la carte quand on active le suivi
watch(
  () => isWatchingLocation.value,
  async (watching) => {
    if (watching && currentLocation.value) {
      // Attendre que Vue mette à jour le DOM
      await nextTick();
      // Puis attendre un peu pour que le rendering soit complet
      setTimeout(() => {
        initMap();
      }, 25);
    } else {
      destroyMap();
    }
  }
);
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

/* Assurer que Leaflet fonctionne correctement */
:deep(.leaflet-container) {
  background: #ddd;
  outline: 0;
  z-index: 1;
  -webkit-font-smoothing: antialiased;
}

:deep(.leaflet-tile) {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Optimisations pour canvas rendering */
:deep(.leaflet-canvas-container) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.leaflet-pane.leaflet-renderer-pane canvas) {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: none;
}

/* Optimization pour les interactions */
:deep(.leaflet-interactive) {
  cursor: pointer;
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
}

.map-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: #fff;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1.5rem;
  border-bottom: 2px solid #e5e5e5;
  background: #fff;
}

.map-header h2 {
  margin: 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #000000;
}

.map-footer {
  padding: 1.5rem;
  border-top: 2px solid #e5e5e5;
  background: #fff;
  display: flex;
  justify-content: center;
}

.btn-primary,
.btn-danger,
.btn-back {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
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

/* Permission Modal */
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

.location-info {
  background: #f0f9ff;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ddd;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.95rem;
  color: #333;
}

.error {
  background: #ffe5e5;
  color: #ff4444;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ff4444;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.95rem;
}

.map-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #f9f9f9;
  position: relative;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #666;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.1rem;
}

.leaflet-map {
  flex: 1;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.pets-list {
  width: 40%;
  padding: 1.5rem;
  overflow-y: auto;
  border-left: 2px solid #e5e5e5;
  background: #fff;
  max-height: 100%;
}

.pets-list h3 {
  margin: 0 0 1.5rem 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #000;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
}

.pet-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid #e5e5e5;
}

.pet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
  border-color: #627DE0;
}

.pet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 2rem;
}

.pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-emoji {
  font-size: 1.5rem;
}

.pet-info {
  flex: 1;
  min-width: 0;
}

.pet-info h4 {
  margin: 0 0 0.25rem 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.owner {
  margin: 0 0 0.5rem 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.distance {
  margin: 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.85rem;
  color: #627DE0;
  font-weight: 700;
}

.online-indicator {
  font-size: 1.2rem;
  flex-shrink: 0;
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

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
}

.modal-content p {
  margin: 0.5rem 0;
  font-family: 'Pixelify Sans', monospace;
  font-size: 0.95rem;
  color: #333;
}

.online-status {
  color: #10b981;
  font-weight: 700;
}

.offline-status {
  color: #6b7280;
  font-weight: 700;
}

.stats {
  margin: 1rem 0;
}

.stat {
  margin-bottom: 1rem;
}

.stat span {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s;
}

.fill.health {
  background: #10b981;
}

.fill.happiness {
  background: #f59e0b;
}

.fill.hunger {
  background: #ef4444;
}

.btn-close {
  display: block;
  width: 100%;
  padding: 1rem;
  background: #627DE0;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1.5rem;
}

.btn-close:hover {
  background: #5169c7;
}

/* Responsive */
@media (max-width: 768px) {
  .map-view {
    padding: 0.5rem;
    height: calc(100vh - 60px);
  }

  .map-header {
    flex-direction: column;
    align-items: stretch;
  }

  .map-header h2 {
    margin-bottom: 0.5rem;
  }

  .map-container {
    flex-direction: column;
  }

  .leaflet-map {
    width: 100%;
    min-height: 300px;
    flex: 1;
  }

  .pets-list {
    width: 100%;
    border-left: none;
    border-top: 1px solid #ddd;
    max-height: 300px;
  }
}
</style>
