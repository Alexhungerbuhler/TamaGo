# 🚀 Test Rapide - Voir 2 Tamagotchis sur la Carte

## ⚡ Méthode la plus rapide (5 minutes)

### 1. Démarrer les serveurs

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Préparer Chrome DevTools

1. Ouvrir Chrome
2. Appuyer sur **F12**
3. Appuyer sur **Ctrl+Shift+P** (Windows) ou **Cmd+Shift+P** (Mac)
4. Taper **"sensors"**
5. Cliquer sur **"Show Sensors"**

### 3. Onglet 1 - Premier utilisateur

**Dans l'onglet Sensors:**
```
Location: Custom location
Latitude:  46.7785
Longitude: 6.6411
```

**Dans le navigateur:**
```
1. http://localhost:5173/register
2. Créer un compte (user1@test.com / Test1234!)
3. Créer un Tamagotchi "Pikachu"
4. Aller sur http://localhost:5173/map
5. Cliquer "Activer la géolocalisation"
```

### 4. Onglet 2 - Deuxième utilisateur (Navigation privée)

**Ouvrir fenêtre privée:**
- **Ctrl+Shift+N** (Windows)
- **Cmd+Shift+N** (Mac)

**Dans l'onglet Sensors de cette fenêtre:**
```
Location: Custom location
Latitude:  46.7790  ← (500m plus loin)
Longitude: 6.6415
```

**Dans le navigateur:**
```
1. http://localhost:5173/register
2. Créer un compte (user2@test.com / Test1234!)
3. Créer un Tamagotchi "Bulbizarre"
4. Aller sur http://localhost:5173/map
5. Cliquer "Activer la géolocalisation"
```

### 5. Résultat attendu ✅

**Onglet 1 devrait afficher:**
```
Tamagotchis à proximité (2)

🐣 Pikachu
👤 user1
❤️ 100% 😊 100%
📏 0 m
🟢

🐣 Bulbizarre
👤 user2
❤️ 100% 😊 100%
📏 ~500 m
🟢
```

**Onglet 2 devrait afficher la même chose !**

---

## 🐛 Si tu ne vois qu'un seul Tamagotchi

### Augmenter le rayon de recherche:

Éditer `frontend/src/views/MapView.vue` ligne ~99:

```javascript
function startTracking() {
  startWatchingLocation(50000); // 50km au lieu de 1000m
}
```

Sauvegarder et rafraîchir la page (Ctrl+R).

---

## 📊 Vérifications

### Console Backend (Terminal 1):
```
✅ User authenticated: <userId>
✅ User joined location: room_46.77_6.64
```

### Console Navigateur (F12 → Console):
```javascript
// Tester dans la console
wsService.isConnected  // doit afficher: true
```

---

## 🎯 Tester avec tes collègues

### Si vous êtes dans le même bureau:

1. **Toi:** Partage ton IP locale
   ```bash
   # Windows
   ipconfig
   # Chercher "Adresse IPv4" → ex: 192.168.1.10
   ```

2. **Tes collègues:** Créent un fichier `.env` dans `frontend/`:
   ```env
   VITE_API_BASE_URL=http://192.168.1.10:3000
   ```

3. **Tes collègues:** Lancent uniquement le frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Tout le monde:**
   - Crée son compte
   - Crée son Tamagotchi
   - Va sur `/map`
   - Active la géolocalisation

5. **Magie:** Vous vous voyez mutuellement ! 🎉

---

## 💡 Positions GPS pré-configurées

### Copier-coller dans DevTools Sensors:

**Yverdon Centre:**
```
Latitude: 46.7785
Longitude: 6.6411
```

**Yverdon Nord (+500m):**
```
Latitude: 46.7820
Longitude: 6.6411
```

**Yverdon Sud (+500m):**
```
Latitude: 46.7750
Longitude: 6.6411
```

**Lausanne:**
```
Latitude: 46.5197
Longitude: 6.6323
```

---

## 🎮 Tester les notifications

1. Créer un Tamagotchi
2. Attendre 60 secondes (health check automatique)
3. Une notification devrait apparaître en haut à droite
4. Cliquer dessus pour la fermer

---

**C'est tout ! Le système fonctionne ! 🚀**

Pour plus de détails → [TEST_WEBSOCKET_GUIDE.md](./TEST_WEBSOCKET_GUIDE.md)
