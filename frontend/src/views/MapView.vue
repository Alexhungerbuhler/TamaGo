<template>
  <div class="users-view">
    <!-- Permission Modal -->
    <div v-if="showPermissionModal" class="permission-modal-overlay">
      <div class="permission-modal">
        <h2>Location Access</h2>
        <p>TamaGo needs your location to find nearby users.</p>
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

    <div class="header">
      <button class="btn-back" @click="goBack">
        <img src="/icons/ArrowDirectionIBackcon.svg" alt="Back" class="back-icon" />
      </button>
      <h1>Users Nearby</h1>
      <div v-if="currentLocation" class="location-badge">
        {{ currentLocation.latitude.toFixed(4) }}, {{ currentLocation.longitude.toFixed(4) }}
      </div>
    </div>

    <div class="content">


      <!-- Users List -->
      <div class="users-container">
        <h2 v-if="getOnlineUsersList().length === 0" class="no-users">
          No users nearby
        </h2>
        
        <div v-else class="users-list">
          <div 
            v-for="user in getUsersWithDistance()" 
            :key="user._id"
            class="user-card"
            @click="selectedUser = user"
          >
            <div class="user-avatar"></div>
            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p class="distance">
                {{ user.distance.toFixed(2) }} m away
              </p>
              <p class="coords">
                {{ user.location.coordinates[1].toFixed(4) }}, {{ user.location.coordinates[0].toFixed(4) }}
              </p>
            </div>
            <div class="status-badge"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="locationError" class="error">
        {{ locationError }}
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="user-detail-modal" @click="selectedUser = null">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedUser.name }}</h3>
        <p class="location-detail">
          {{ selectedUser.location.coordinates[1].toFixed(6) }}, 
          {{ selectedUser.location.coordinates[0].toFixed(6) }}
        </p>
        <p v-if="selectedUser.distance" class="distance-detail">
          {{ selectedUser.distance.toFixed(2) }} m away
        </p>
        <p class="online-status">Online</p>
        <button @click="selectedUser = null" class="btn-close">Close</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNearbyPets, useOnlineUsers } from '../composables/useWebSocket';
import { useRouter } from 'vue-router';

console.log('📍 MapView.vue script starting...');

const router = useRouter();
console.log('📍 Router imported');

const {
  currentLocation,
  isWatchingLocation,
  locationError,
  startWatchingLocation,
  stopWatchingLocation
} = useNearbyPets();
console.log('📍 useNearbyPets imported successfully');

const { getOnlineUsersList } = useOnlineUsers();
console.log('📍 useOnlineUsers imported successfully');

const selectedUser = ref(null);
const showPermissionModal = ref(true);
console.log('📍 Refs created');

function requestLocationPermission() {
  console.log('📍 requestLocationPermission called');
  showPermissionModal.value = false;
  startWatchingLocation(1000);
}

function rejectLocationPermission() {
  console.log('📍 rejectLocationPermission called');
  showPermissionModal.value = false;
  router.push('/tamago');
}

function startTracking() {
  console.log('📍 startTracking called');
  showPermissionModal.value = false;
  startWatchingLocation(1000);
}

function goBack() {
  console.log('📍 goBack called');
  stopWatchingLocation();
  router.push('/tamago');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getUsersWithDistance() {
  console.log('📍 getUsersWithDistance called, currentLocation:', currentLocation.value);
  if (!currentLocation.value) {
    return [];
  }

  const users = getOnlineUsersList();
  console.log('📍 Online users:', users.length);

  return users
    .map(user => ({
      ...user,
      distance: calculateDistance(
        currentLocation.value.latitude,
        currentLocation.value.longitude,
        user.location.coordinates[1],
        user.location.coordinates[0]
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

onMounted(() => {
  console.log('📍 MapView mounted - waiting for location permission');
  showPermissionModal.value = true;
});

onUnmounted(() => {
  console.log('📍 MapView unmounted');
  stopWatchingLocation();
});

console.log('📍 MapView.vue script loaded successfully');

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.users-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.header {
  padding: 1.5rem 1.5rem 1rem;
  background: #627DE0;
  color: white;
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-back {
  position: absolute;
  left: 1.5rem;
  top: 1.5rem;
  padding: 0.5rem;
  background: #ffffff;
  color: #000000;
  border: 4px solid #000000;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
}

.btn-back:hover {
  transform: scale(1.05);
}

.btn-back:active {
  transform: scale(0.98);
}

.back-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.location-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: inline-block;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.your-location {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-family: 'Pixelify Sans', monospace;
  border-left: 4px solid #627DE0;
}

.your-location-icon {
  font-size: 2rem;
}

.your-location-info h3 {
  margin: 0 0 0.25rem 0;
  color: #000;
  font-size: 1rem;
}

.coords {
  margin: 0;
  color: #666;
  font-size: 0.8rem;
}

.users-container {
  flex: 1;
}

.no-users {
  text-align: center;
  color: #999;
  font-family: 'Pixelify Sans', monospace;
  padding: 2rem 1rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #627DE0;
  font-family: 'Pixelify Sans', monospace;
}

.user-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left-color: #5169c7;
}

.user-avatar {
  font-size: 2rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  margin: 0 0 0.25rem 0;
  color: #000;
  font-size: 1rem;
  font-weight: 700;
}

.distance {
  margin: 0.25rem 0;
  color: #627DE0;
  font-size: 0.9rem;
  font-weight: 600;
}

.user-info > .coords {
  margin: 0.25rem 0 0 0;
  color: #999;
  font-size: 0.75rem;
}

.status-badge {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error {
  background: #fee;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid #fcc;
  color: #c00;
  font-family: 'Pixelify Sans', monospace;
  margin-top: 1rem;
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
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  font-family: 'Pixelify Sans', monospace;
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #000;
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-content p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.location-detail {
  color: #627DE0 !important;
  font-weight: 600;
}

.distance-detail {
  color: #627DE0 !important;
  font-weight: 600;
}

.online-status {
  color: #22c55e !important;
  font-weight: 600;
  margin-top: 1rem !important;
}

.btn-close {
  margin-top: 1.5rem;
  padding: 0.75rem 1rem;
  background: #627DE0;
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'Pixelify Sans', monospace;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #5169c7;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.4rem;
  }

  .user-card {
    padding: 0.75rem 1rem;
  }

  .btn-back {
    left: 1rem;
    top: 1.2rem;
  }
}
</style>
