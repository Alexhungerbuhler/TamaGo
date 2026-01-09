import { ref, onMounted, onUnmounted } from 'vue';
import wsService from '../services/websocket';

/**
 * Composable pour utiliser WebSocket dans les composants Vue
 * @param {Object} options - Options de configuration
 * @returns {Object} - Méthodes et états WebSocket
 */
export function useWebSocket(options = {}) {
  const isConnected = ref(wsService.connected);
  const error = ref(null);
  
  const { autoConnect = false } = options;

  // Mettre à jour l'état de connexion
  const updateConnectionStatus = () => {
    isConnected.value = wsService.connected;
  };

  // Gestion des événements de connexion
  const unsubscribeEstablished = wsService.on('connection:established', () => {
    isConnected.value = true;
    error.value = null;
  });

  const unsubscribeLost = wsService.on('connection:lost', () => {
    isConnected.value = false;
  });

  const unsubscribeError = wsService.on('connection:error', (err) => {
    error.value = err.message;
  });

  // Nettoyage
  onUnmounted(() => {
    unsubscribeEstablished();
    unsubscribeLost();
    unsubscribeError();
  });

  if (autoConnect) {
    onMounted(() => {
      const token = localStorage.getItem('tamago_auth_token');
      if (token) {
        wsService.connect(token);
      }
    });
  }

  return {
    isConnected,
    error,
    
    // Méthodes de connexion
    connect: (token) => wsService.connect(token),
    disconnect: () => wsService.disconnect(),
    
    // Méthodes de localisation
    joinLocation: (location) => wsService.joinLocation(location),
    leaveLocation: () => wsService.leaveLocation(),
    updatePetLocation: (petId, lat, lng) => wsService.updatePetLocation(petId, lat, lng),
    
    // Méthodes de santé
    checkPetHealth: () => wsService.checkPetHealth(),
    
    // Écouteurs
    on: (event, callback) => wsService.on(event, callback),
    off: (event, callback) => wsService.off(event, callback)
  };
}

/**
 * Composable pour écouter les mises à jour de pets
 */
export function usePetUpdates() {
  const updates = ref([]);
  
  const handleUpdate = (data) => {
    updates.value.push({
      ...data,
      timestamp: new Date()
    });
  };

  const unsubscribe = wsService.on('pet:updated', handleUpdate);

  onUnmounted(() => {
    unsubscribe();
  });

  const clearUpdates = () => {
    updates.value = [];
  };

  return {
    updates,
    clearUpdates
  };
}

/**
 * Composable pour gérer les notifications de pets
 */
export function usePetNotifications() {
  const notifications = ref([]);
  
  const handleAlert = (data) => {
    notifications.value.push({
      ...data,
      level: 'warning',
      timestamp: new Date()
    });
  };

  const handleCritical = (data) => {
    notifications.value.push({
      ...data,
      level: 'critical',
      timestamp: new Date()
    });
  };

  const unsubscribeAlert = wsService.on('pet:alert', handleAlert);
  const unsubscribeCritical = wsService.on('pet:critical', handleCritical);

  onUnmounted(() => {
    unsubscribeAlert();
    unsubscribeCritical();
  });

  const clearNotifications = () => {
    notifications.value = [];
  };

  const removeNotification = (index) => {
    notifications.value.splice(index, 1);
  };

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
}

/**
 * Composable pour gérer les utilisateurs en ligne
 */
export function useOnlineUsers() {
  const onlineUsers = ref(new Set());
  
  const handleUserOnline = (data) => {
    onlineUsers.value.add(data.userId);
  };

  const handleUserOffline = (data) => {
    onlineUsers.value.delete(data.userId);
  };

  const unsubscribeOnline = wsService.on('user:online', handleUserOnline);
  const unsubscribeOffline = wsService.on('user:offline', handleUserOffline);

  onUnmounted(() => {
    unsubscribeOnline();
    unsubscribeOffline();
  });

  const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId);
  };

  return {
    onlineUsers,
    isUserOnline
  };
}

/**
 * Composable pour la géolocalisation et pets à proximité
 */
export function useNearbyPets() {
  const nearbyPets = ref([]);
  const currentLocation = ref(null);
  const isWatchingLocation = ref(false);
  const locationError = ref(null);
  let watchId = null;

  const handleNearbyPets = (data) => {
    console.log('🗺️ Événement location:nearby-pets reçu:', data);
    nearbyPets.value = data.pets;
  };

  const handlePetMoved = (data) => {
    console.log('🐾 Pet déplacé:', data);
    // Mettre à jour la position d'un pet dans la liste
    const index = nearbyPets.value.findIndex(p => p._id === data.petId);
    if (index !== -1) {
      nearbyPets.value[index].location = {
        coordinates: [data.location.longitude, data.location.latitude]
      };
    }
  };

  const unsubscribeNearby = wsService.on('location:nearby-pets', handleNearbyPets);
  const unsubscribeMoved = wsService.on('pet:moved', handlePetMoved);

  const startWatchingLocation = (radius = 1000) => {
    if (!navigator.geolocation) {
      locationError.value = 'Geolocation not supported';
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        currentLocation.value = { latitude, longitude };
        
        console.log('📍 Géolocalisation reçue:', { latitude, longitude, radius });
        console.log('🔌 WebSocket connecté?', wsService.isConnected);
        
        // Rejoindre la zone géographique
        wsService.joinLocation({ latitude, longitude, radius });
        isWatchingLocation.value = true;
        locationError.value = null;
      },
      (error) => {
        locationError.value = error.message;
        isWatchingLocation.value = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const stopWatchingLocation = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    wsService.leaveLocation();
    isWatchingLocation.value = false;
  };

  onUnmounted(() => {
    stopWatchingLocation();
    unsubscribeNearby();
    unsubscribeMoved();
  });

  return {
    nearbyPets,
    currentLocation,
    isWatchingLocation,
    locationError,
    startWatchingLocation,
    stopWatchingLocation
  };
}
