<template>
  <div class="map-view">
    <div class="map-header">
      <h2>🗺️ Carte des Tamagotchis</h2>
      <button 
        v-if="!isWatchingLocation" 
        @click="startTracking"
        class="btn-primary"
      >
        📍 Activer la géolocalisation
      </button>
      <button 
        v-else 
        @click="stopTracking"
        class="btn-danger"
      >
        ⏹️ Arrêter le suivi
      </button>
    </div>

    <div v-if="locationError" class="error">
      ❌ {{ locationError }}
    </div>

    <div v-if="currentLocation && isWatchingLocation" class="location-info">
      📍 Position actuelle: {{ currentLocation.latitude.toFixed(6) }}, {{ currentLocation.longitude.toFixed(6) }}
    </div>

    <div class="map-container" ref="mapContainer">
      <div v-if="!isWatchingLocation" class="map-placeholder">
        <p>Activez la géolocalisation pour voir les Tamagotchis à proximité</p>
      </div>
      
      <div v-else class="pets-list">
        <h3>Tamagotchis à proximité ({{ nearbyPets.length }})</h3>
        
        <div v-if="nearbyPets.length === 0" class="empty">
          Aucun Tamagotchi à proximité
        </div>

        <div
          v-for="pet in nearbyPets"
          :key="pet._id"
          class="pet-card"
          @click="selectPet(pet)"
        >
          <div class="pet-avatar">
            <img v-if="pet.imageUrl" :src="pet.imageUrl" :alt="pet.name">
            <span v-else class="pet-emoji">🐣</span>
          </div>
          
          <div class="pet-info">
            <h4>{{ pet.name }}</h4>
            <p class="owner">👤 {{ pet.owner?.name || 'Inconnu' }}</p>
            <div class="stats-mini">
              <span>❤️ {{ pet.health }}%</span>
              <span>😊 {{ pet.happiness }}%</span>
            </div>
            <p v-if="pet.location" class="distance">
              📏 {{ calculateDistance(pet.location) }} m
            </p>
          </div>

          <div 
            v-if="onlineUsers.has(pet.owner?._id)"
            class="online-indicator"
            title="En ligne"
          >
            🟢
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPet" class="pet-detail-modal" @click="selectedPet = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedPet.name }}</h3>
        <p>Propriétaire: {{ selectedPet.owner?.name }}</p>
        <div class="stats">
          <div class="stat">
            <span>Santé</span>
            <div class="bar">
              <div class="fill health" :style="{ width: selectedPet.health + '%' }"></div>
            </div>
          </div>
          <div class="stat">
            <span>Bonheur</span>
            <div class="bar">
              <div class="fill happiness" :style="{ width: selectedPet.happiness + '%' }"></div>
            </div>
          </div>
          <div class="stat">
            <span>Faim</span>
            <div class="bar">
              <div class="fill hunger" :style="{ width: selectedPet.hunger + '%' }"></div>
            </div>
          </div>
        </div>
        <button @click="selectedPet = null" class="btn-close">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNearbyPets, useOnlineUsers } from '../composables/useWebSocket';
import { useRouter } from 'vue-router';

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
const mapContainer = ref(null);

function startTracking() {
  startWatchingLocation(1000); // 1km de rayon
}

function stopTracking() {
  stopWatchingLocation();
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
</script>

<style scoped>
.map-view {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.map-header h2 {
  margin: 0;
}

.btn-primary, .btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
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

.location-info {
  background: #f0f9ff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.map-container {
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
}

.pets-list {
  padding: 1rem;
}

.pets-list h3 {
  margin-top: 0;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.pet-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.pet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.pet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-emoji {
  font-size: 2rem;
}

.pet-info {
  flex: 1;
}

.pet-info h4 {
  margin: 0 0 0.25rem 0;
}

.owner {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.stats-mini {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.distance {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
}

.online-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8rem;
}

.pet-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-content h3 {
  margin-top: 0;
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
  background: #eee;
  border-radius: 6px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s;
}

.fill.health {
  background: #4caf50;
}

.fill.happiness {
  background: #ffc107;
}

.fill.hunger {
  background: #ff5722;
}

.btn-close {
  padding: 0.5rem 1rem;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-close:hover {
  background: #555;
}
</style>
