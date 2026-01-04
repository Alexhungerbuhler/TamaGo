# 🚀 Quick Start - WebSocket TamaGo

## Installation rapide

### 1. Installer les dépendances

**Backend :**
```bash
cd backend
npm install socket.io
```

**Frontend :**
```bash
cd frontend
npm install socket.io-client
```

### 2. Démarrer les serveurs

**Backend (terminal 1) :**
```bash
cd backend
npm start
```
✅ Serveur démarré sur `http://localhost:3000`
✅ WebSocket disponible sur `ws://localhost:3000`

**Frontend (terminal 2) :**
```bash
cd frontend
npm run dev
```
✅ Application démarrée sur `http://localhost:5173`

---

## 🧪 Test complet

### 1. Créer un compte et se connecter

```
http://localhost:5173/register
```

- Username: `test_user`
- Email: `test@example.com`
- Password: `Test1234!`

### 2. Créer un Tamagotchi

```
http://localhost:5173/tamagotchis
→ Cliquer "Créer un Tamagotchi"
```

### 3. Tester les fonctionnalités WebSocket

#### 🗺️ Carte avec géolocalisation
```
http://localhost:5173/map
→ Cliquer "Activer la géolocalisation"
→ Autoriser la géolocalisation
→ Voir les pets à proximité
```

#### 🔔 Notifications en temps réel
```
1. Nourrir/jouer avec votre pet
2. Observer la notification en haut à droite
3. Observer le panneau de notifications
```

#### 🟢 Statut en ligne
```
1. Ouvrir un 2e onglet
2. Se connecter avec un autre compte
3. Voir l'indicateur "🟢" sur la carte
```

---

## 📊 Vérifier que tout fonctionne

### Backend - Vérifier WebSocket

Dans la console backend, vous devriez voir :
```
WebSocket server initialized
✅ User connected: <userId>
✅ User joined location
```

### Frontend - Vérifier la connexion

Ouvrir la console navigateur (F12):
```javascript
// Vérifier la connexion
console.log(window.wsService); // Devrait afficher le service

// Écouter les événements
wsService.on('pet:updated', (data) => console.log('Pet updated:', data));
```

---

## 🎯 Fonctionnalités disponibles

| Fonctionnalité | Description | Route/Composable |
|---|---|---|
| 🗺️ Carte | Voir pets à proximité | `/map` |
| 🔔 Notifications | Alertes temps réel | `NotificationsPanel` |
| 🟢 En ligne | Voir qui est connecté | `useOnlineUsers()` |
| 📍 Géolocalisation | Tracking position | `useNearbyPets()` |
| 🎮 Mises à jour | Stats en direct | `usePetUpdates()` |

---

## 🐛 Dépannage rapide

### WebSocket ne se connecte pas
```bash
# Vérifier que socket.io est installé
cd backend && npm list socket.io
cd frontend && npm list socket.io-client

# Réinstaller si nécessaire
npm install socket.io socket.io-client
```

### CORS Error
Vérifier que le backend a bien :
```javascript
// backend/src/app.js
app.use(cors({ origin: 'http://localhost:5173' }));
```

### Token invalide
```javascript
// Supprimer le token et se reconnecter
localStorage.clear();
// Puis se reconnecter via /login
```

### Géolocalisation ne marche pas
- ✅ Autoriser dans les paramètres du navigateur
- ✅ Utiliser HTTPS en production (ok sur localhost)
- ✅ Vérifier la console pour les erreurs

---

## 📚 Documentation complète

Pour plus de détails, voir :
- [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md) - Guide complet
- [GUIDE_STORE_AUTH.md](./GUIDE_STORE_AUTH.md) - Store d'authentification
- [SERVICE_API_SETUP.md](./SERVICE_API_SETUP.md) - Services API

---

## ✨ Prochaines étapes

1. Personnaliser les notifications
2. Ajouter une vraie carte (Leaflet/Mapbox)
3. Implémenter le chat entre utilisateurs
4. Ajouter des achievements en temps réel
5. Créer des événements géolocalisés

Bon développement ! 🚀
