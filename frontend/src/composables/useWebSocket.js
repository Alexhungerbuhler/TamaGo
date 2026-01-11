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

  return {
    notifications
  };
}

/**
 * Composable pour gérer les utilisateurs en ligne
 */
export function useOnlineUsers() {
  const onlineUsers = ref(new Set());
  const onlineUsersData = ref(new Map()); // Stocker les données complètes des utilisateurs
  
  const handleExistingUsers = (data) => {
    console.log('📊 handleExistingUsers reçu:', data);
    // Ajouter tous les utilisateurs existants avec leur location
    if (data.users && Array.isArray(data.users)) {
      data.users.forEach(user => {
        if (user.userId) {
          onlineUsers.value.add(user.userId);
          onlineUsersData.value.set(user.userId, {
            _id: user.userId,
            name: user.userName || 'Unknown',
            location: user.location
          });
        }
      });
      console.log('✅ Utilisateurs existants ajoutés, total:', onlineUsersData.value.size);
    }
  };

  const handleUserOnline = (data) => {
    console.log('🟢 handleUserOnline reçu:', data);
    onlineUsers.value.add(data.userId);
    // Stocker les données utilisateur si disponibles
    if (data.userId) {
      onlineUsersData.value.set(data.userId, {
        _id: data.userId,
        name: data.userName || 'Unknown',
        location: data.location,
        connectedAt: data.connectedAt
      });
      console.log('✅ Utilisateur en ligne ajouté, total:', onlineUsersData.value.size);
    }
  };

  const handleUserOffline = (data) => {
    console.log('🔴 handleUserOffline reçu:', data);
    onlineUsers.value.delete(data.userId);
    onlineUsersData.value.delete(data.userId);
  };

  const handleUserLocation = (data) => {
    console.log('📍 handleUserLocation reçu:', data);
    if (data.userId && data.location) {
      // Ajouter l'utilisateur à la liste des utilisateurs en ligne
      onlineUsers.value.add(data.userId);
      
      // Mettre à jour la location de l'utilisateur
      const userData = onlineUsersData.value.get(data.userId);
      if (userData) {
        userData.location = data.location;
      } else {
        onlineUsersData.value.set(data.userId, {
          _id: data.userId,
          name: data.userName || 'Unknown',
          location: data.location
        });
      }
      console.log('✅ Location mise à jour, utilisateurs avec location:', 
        Array.from(onlineUsersData.value.values()).filter(u => u.location).length);
    }
  };

  const unsubscribeExisting = wsService.on('users:existing', handleExistingUsers);
  const unsubscribeOnline = wsService.on('user:online', handleUserOnline);
  const unsubscribeOffline = wsService.on('user:offline', handleUserOffline);
  const unsubscribeUserLocation = wsService.on('user:location', handleUserLocation);

  onUnmounted(() => {
    unsubscribeExisting();
    unsubscribeOnline();
    unsubscribeOffline();
    unsubscribeUserLocation();
  });

  const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId);
  };

  const getUserData = (userId) => {
    return onlineUsersData.value.get(userId);
  };

  const getOnlineUsersList = () => {
    return Array.from(onlineUsersData.value.values()).filter(user => user.location);
  };

  return {
    onlineUsers,
    onlineUsersData,
    isUserOnline,
    getUserData,
    getOnlineUsersList
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
    nearbyPets.value = data.pets;
  };

  const handlePetMoved = (data) => {
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
    console.log('📍 startWatchingLocation called with radius:', radius);
    
    if (!navigator.geolocation) {
      locationError.value = 'Geolocation not supported';
      console.error('❌ Geolocation not supported');
      return;
    }

    console.log('📍 Requesting geolocation...');
    
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Geolocation received:', { latitude, longitude });
        currentLocation.value = { latitude, longitude };
        
        // Rejoindre la zone géographique
        console.log('📍 Sending location:join to WebSocket...');
        wsService.joinLocation({ latitude, longitude, radius });
        isWatchingLocation.value = true;
        locationError.value = null;
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
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
