# 🔌 Guide WebSocket - TamaGo

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [Utilisation](#utilisation)
5. [Fonctionnalités](#fonctionnalités)
6. [API Reference](#api-reference)

---

## 🎯 Vue d'ensemble

Le système WebSocket de TamaGo utilise **Socket.IO** pour fournir des fonctionnalités temps réel :
- 🗺️ **Carte interactive** : Voir les Tamagotchis à proximité
- 🔔 **Notifications** : Alertes quand votre pet va mal
- 🟢 **Statut en ligne** : Savoir qui est connecté
- 📍 **Géolocalisation** : Tracking en temps réel

---

## 📦 Installation

### Backend
```bash
cd backend
npm install socket.io
```

### Frontend
```bash
cd frontend
npm install socket.io-client
```

---

## 🏗️ Architecture

### Backend (`backend/src/websocket.js`)

**Connexion avec authentification JWT :**
```javascript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // Vérifie le token et attache l'utilisateur
});
```

**Événements émis par le serveur :**
- `user:online` - Utilisateur se connecte
- `user:offline` - Utilisateur se déconnecte
- `pet:updated` - Stats du pet mises à jour
- `pet:moved` - Pet a changé de position
- `pet:alert` - Pet nécessite attention (santé < 50%)
- `pet:critical` - Pet en danger (santé < 20%)
- `location:nearby-pets` - Liste des pets à proximité

**Événements reçus par le serveur :**
- `location:join` - Rejoindre une zone géographique
- `location:leave` - Quitter une zone
- `pet:update-location` - Mettre à jour la position d'un pet
- `pet:check-health` - Vérifier l'état de santé

### Frontend

#### Service WebSocket (`src/services/websocket.js`)
```javascript
import wsService from '@/services/websocket';

// Connexion automatique lors du login
wsService.connect(token);

// Déconnexion lors du logout
wsService.disconnect();
```

#### Composables (`src/composables/useWebSocket.js`)
5 composables Vue pour faciliter l'intégration :

**1. useWebSocket** - Gestion de la connexion
```javascript
const { isConnected, connect, disconnect } = useWebSocket();
```

**2. usePetUpdates** - Écouter les mises à jour des pets
```javascript
const { updates, listenToUpdates, stopListening } = usePetUpdates();
```

**3. usePetNotifications** - Recevoir les alertes
```javascript
const { notifications, listenToNotifications, stopListening } = usePetNotifications();
```

**4. useOnlineUsers** - Voir qui est en ligne
```javascript
const { onlineUsers, isUserOnline } = useOnlineUsers();
```

**5. useNearbyPets** - Géolocalisation
```javascript
const { nearbyPets, currentLocation, startWatchingLocation } = useNearbyPets();
```

---

## 🚀 Utilisation

### 1. Connexion automatique

La connexion WebSocket est gérée automatiquement par le store d'authentification :

**`src/store/index.js`**
```javascript
async login(credentials) {
  const response = await authService.login(credentials);
  this.user = response.user;
  this.token = response.token;
  
  // ✅ Connexion WebSocket automatique
  wsService.connect(this.token);
}
```

### 2. Écouter les mises à jour des pets

**Dans un composant :**
```vue
<script setup>
import { usePetUpdates } from '@/composables/useWebSocket';

const { updates, listenToUpdates } = usePetUpdates();

// Démarre l'écoute au montage
listenToUpdates();

// Les updates sont réactifs
watchEffect(() => {
  console.log('Pet mis à jour:', updates.value);
});
</script>
```

### 3. Afficher les notifications

Le panneau de notifications est déjà intégré dans `App.vue` :

```vue
<template>
  <div id="app">
    <router-view />
    <NotificationsPanel /> <!-- ✅ Affiche les notifications -->
  </div>
</template>
```

### 4. Carte avec géolocalisation

**`MapView.vue`** utilise le composable `useNearbyPets` :

```vue
<script setup>
import { useNearbyPets, useOnlineUsers } from '@/composables/useWebSocket';

const { 
  nearbyPets,           // Liste des pets à proximité
  currentLocation,      // Position actuelle
  isWatchingLocation,   // Statut du tracking
  startWatchingLocation,
  stopWatchingLocation 
} = useNearbyPets();

const { onlineUsers } = useOnlineUsers();

// Démarre le tracking avec rayon de 1km
function startTracking() {
  startWatchingLocation(1000);
}
</script>
```

### 5. Vérifier si un utilisateur est en ligne

```vue
<script setup>
import { useOnlineUsers } from '@/composables/useWebSocket';

const { onlineUsers, isUserOnline } = useOnlineUsers();

const userId = 'someUserId';
console.log(isUserOnline(userId)); // true/false
</script>
```

---

## ⚡ Fonctionnalités

### 🔔 Système de notifications

**Store de notifications (`src/store/notifications.js`)**
```javascript
import { useNotificationsStore } from '@/store/notifications';

const notifStore = useNotificationsStore();

// Ajouter une notification
notifStore.addNotification({
  type: 'warning',
  message: 'Votre pet a faim!',
  pet: petObject
});

// Marquer comme lue
notifStore.markAsRead(notificationId);

// Effacer toutes les notifications
notifStore.clearAll();

// Demander la permission pour les notifications navigateur
await notifStore.requestNotificationPermission();
```

**Notifications navigateur :**
- Demande automatique de permission
- Notifications même quand l'onglet est en arrière-plan
- Icône et message personnalisés

### 🗺️ Géolocalisation

**Fonctionnement :**
1. L'utilisateur active la géolocalisation
2. Le navigateur demande la permission
3. Position envoyée au serveur via `location:join`
4. Serveur rejoint une room basée sur les coordonnées
5. Serveur envoie la liste des pets dans cette zone

**Calcul de distance :**
```javascript
function calculateDistance(location) {
  const [lng, lat] = location.coordinates;
  const R = 6371e3; // Rayon de la Terre en mètres
  
  // Formule de Haversine
  const φ1 = currentLocation.value.latitude * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  // ... calcul
  
  return Math.round(distance);
}
```

### 🎮 Mises à jour en temps réel

**Store des pets (`src/store/pets.js`)**

Écoute automatiquement les événements WebSocket :
```javascript
initWebSocketListeners() {
  wsService.on('pet:updated', (data) => {
    // Met à jour le pet dans le store
    this.updatePetStats(data.pet);
  });

  wsService.on('pet:alert', (data) => {
    // Ajoute une notification
    const notifStore = useNotificationsStore();
    notifStore.addNotification({
      type: 'warning',
      message: `${data.pet.name} a besoin d'attention!`,
      pet: data.pet
    });
  });
}
```

### 🟢 Tracking des utilisateurs en ligne

Le backend maintient une Map des utilisateurs connectés :
```javascript
const connectedUsers = new Map();

socket.on('disconnect', () => {
  connectedUsers.delete(userId);
  io.emit('user:offline', { userId });
});
```

### ⏰ Vérification périodique de santé

Le serveur vérifie automatiquement la santé des pets toutes les 60 secondes :
```javascript
setInterval(async () => {
  for (const [userId, socketId] of connectedUsers.entries()) {
    const pets = await Tamagotchi.find({ owner: userId });
    pets.forEach(pet => {
      if (pet.health < 50 && pet.health >= 20) {
        io.to(socketId).emit('pet:alert', { pet });
      } else if (pet.health < 20) {
        io.to(socketId).emit('pet:critical', { pet });
      }
    });
  }
}, 60000);
```

---

## 📚 API Reference

### Service WebSocket

#### `wsService.connect(token)`
Connecte au serveur WebSocket avec authentification JWT.

```javascript
wsService.connect(token);
```

#### `wsService.disconnect()`
Déconnecte du serveur.

```javascript
wsService.disconnect();
```

#### `wsService.on(event, callback)`
Écoute un événement.

```javascript
wsService.on('pet:updated', (data) => {
  console.log('Pet mis à jour:', data.pet);
});
```

#### `wsService.emit(event, data)`
Émet un événement vers le serveur.

```javascript
wsService.emit('pet:check-health', { petId });
```

#### `wsService.joinLocation(latitude, longitude, radius)`
Rejoint une zone géographique.

```javascript
wsService.joinLocation(46.7785, 6.6411, 1000); // Yverdon, 1km
```

#### `wsService.leaveLocation()`
Quitte la zone actuelle.

```javascript
wsService.leaveLocation();
```

### Composables

#### `useWebSocket()`
```javascript
const {
  isConnected,    // Ref<boolean> - Statut de connexion
  error,          // Ref<string | null> - Erreur éventuelle
  connect,        // Function(token: string) => void
  disconnect      // Function() => void
} = useWebSocket();
```

#### `usePetUpdates()`
```javascript
const {
  updates,          // Ref<object | null> - Dernière mise à jour
  listenToUpdates,  // Function() => void - Commence l'écoute
  stopListening     // Function() => void - Arrête l'écoute
} = usePetUpdates();
```

#### `usePetNotifications()`
```javascript
const {
  notifications,      // Ref<Array> - Liste des notifications
  listenToNotifications, // Function() => void
  stopListening       // Function() => void
} = usePetNotifications();
```

#### `useOnlineUsers()`
```javascript
const {
  onlineUsers,     // Ref<Set<string>> - Set des IDs en ligne
  isUserOnline     // Function(userId: string) => boolean
} = useOnlineUsers();
```

#### `useNearbyPets()`
```javascript
const {
  nearbyPets,              // Ref<Array> - Pets à proximité
  currentLocation,         // Ref<object | null> - Position actuelle
  isWatchingLocation,      // Ref<boolean> - Statut du tracking
  locationError,           // Ref<string | null> - Erreur
  startWatchingLocation,   // Function(radius: number) => void
  stopWatchingLocation     // Function() => void
} = useNearbyPets();
```

---

## 🧪 Tests

### Tester la connexion WebSocket

```javascript
// Dans ApiTestPanel.vue
import wsService from '@/services/websocket';

// Après login
wsService.on('connect', () => {
  console.log('✅ WebSocket connecté!');
});

wsService.on('pet:updated', (data) => {
  console.log('🐣 Pet mis à jour:', data.pet);
});
```

### Tester la géolocalisation

1. Aller sur `/map`
2. Cliquer sur "Activer la géolocalisation"
3. Autoriser la géolocalisation dans le navigateur
4. Vérifier que les pets à proximité s'affichent

### Tester les notifications

1. Se connecter avec un compte
2. Créer un Tamagotchi
3. Laisser la santé descendre < 50%
4. Vérifier qu'une notification apparaît
5. Vérifier la notification navigateur (si permission accordée)

---

## 🔧 Dépannage

### WebSocket ne se connecte pas
- Vérifier que le backend est démarré
- Vérifier que Socket.IO est installé (`npm install socket.io socket.io-client`)
- Vérifier le token JWT dans le localStorage
- Vérifier la console pour les erreurs

### Géolocalisation ne fonctionne pas
- HTTPS requis en production (pas en localhost)
- Vérifier les permissions du navigateur
- Vérifier que `navigator.geolocation` existe

### Notifications ne s'affichent pas
- Vérifier les permissions du navigateur
- Appeler `requestNotificationPermission()`
- Vérifier que le store de notifications est bien importé

---

## 📝 Notes importantes

1. **Authentification requise** : Toutes les fonctionnalités WebSocket nécessitent un utilisateur connecté
2. **HTTPS en production** : La géolocalisation nécessite HTTPS (ou localhost)
3. **Permissions navigateur** : Demander les permissions pour géolocalisation et notifications
4. **Nettoyage** : Les listeners WebSocket sont automatiquement nettoyés lors du démontage des composants
5. **Reconnexion** : Socket.IO gère automatiquement la reconnexion en cas de déconnexion

---

## 🎉 Félicitations !

Votre système WebSocket est maintenant opérationnel. Vous pouvez :
- ✅ Voir les pets à proximité sur la carte
- ✅ Recevoir des notifications en temps réel
- ✅ Savoir qui est en ligne
- ✅ Tracker les mouvements des pets
- ✅ Recevoir des alertes de santé

Pour plus d'informations, consultez la [documentation Socket.IO](https://socket.io/docs/).
