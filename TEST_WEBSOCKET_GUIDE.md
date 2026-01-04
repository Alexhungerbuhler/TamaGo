# 🧪 Guide de Test WebSocket - TamaGo

## 🎯 Comment tester la carte avec plusieurs Tamagotchis

### ✅ OUI, tes collègues peuvent créer leurs comptes et tu verras leurs Tamagotchis !

---

## Option 1: Test Multi-Onglets (Le plus simple pour débuter) ⭐

### Étape par étape:

1. **Ouvrir Chrome DevTools pour simuler des positions GPS différentes**

2. **Onglet 1 (Normal):**
   ```
   1. F12 → Ctrl+Shift+P → "sensors" → "Show Sensors"
   2. Position personnalisée:
      Latitude: 46.7785
      Longitude: 6.6411
   3. Se connecter avec user1
   4. Créer un Tamagotchi "Pika"
   5. Aller sur /map
   6. Activer géolocalisation
   ```

3. **Onglet 2 (Navigation privée Ctrl+Shift+N):**
   ```
   1. F12 → Ctrl+Shift+P → "sensors" → "Show Sensors"
   2. Position personnalisée:
      Latitude: 46.7790  (500m plus loin)
      Longitude: 6.6415
   3. Se connecter avec user2
   4. Créer un Tamagotchi "Bulbi"
   5. Aller sur /map
   6. Activer géolocalisation
   ```

4. **Résultat attendu:**
   - Chaque onglet voit les 2 Tamagotchis
   - Distance affichée (~500m)
   - Indicateur 🟢 actif (les deux users sont en ligne)

---

## Option 2: Test avec Collègues sur le Réseau Local 🌐

### Configuration serveur (Toi):

1. **Trouver ton IP locale:**
   ```bash
   # Windows
   ipconfig
   # Chercher "Adresse IPv4" → ex: 192.168.1.10
   ```

2. **Modifier CORS du backend:**
   
   Éditer `backend/src/app.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5173',
       /^http:\/\/192\.168\.\d+\.\d+:5173$/  // Accepte tout le réseau local
     ],
     credentials: true
   }));
   ```

3. **Démarrer les serveurs:**
   ```bash
   # Terminal 1
   cd backend
   npm start
   
   # Terminal 2
   cd frontend
   npm run dev
   ```

### Configuration collègues:

1. **Créer/modifier `.env` dans le frontend:**
   ```env
   VITE_API_BASE_URL=http://192.168.1.10:3000
   # Remplacer par TON IP locale
   ```

2. **Installer et lancer:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Créer un compte et un Tamagotchi:**
   - Aller sur `http://localhost:5173/register`
   - Créer un compte
   - Créer un Tamagotchi
   - Aller sur `/map`
   - Activer géolocalisation

4. **⚠️ Géolocalisation:**
   - Si vous êtes dans le même bureau → Vous vous verrez !
   - Si vous êtes éloignés → Augmenter le rayon (voir ci-dessous)

---

## 🔧 Augmenter le rayon de recherche (pour tests)

Par défaut: **1000m (1km)**

### Méthode rapide:

Éditer `frontend/src/views/MapView.vue`:
```javascript
function startTracking() {
  startWatchingLocation(50000); // 50km au lieu de 1km
}
```

Puis relancer le frontend.

---

## 🗺️ Simuler différentes positions GPS (Chrome)

### Positions de test suggérées:

| Ville | Latitude | Longitude | Distance |
|-------|----------|-----------|----------|
| Yverdon (Centre) | 46.7785 | 6.6411 | 0m |
| Yverdon (Nord) | 46.7820 | 6.6411 | ~400m |
| Yverdon (Sud) | 46.7750 | 6.6411 | ~400m |
| Lausanne | 46.5197 | 6.6323 | ~29km |
| Genève | 46.2044 | 6.1432 | ~60km |

### Comment changer la position:

```
Chrome DevTools:
1. F12
2. Ctrl+Shift+P (Cmd+Shift+P sur Mac)
3. Taper "sensors"
4. Sélectionner "Show Sensors"
5. Onglet "Sensors" → "Location" → "Custom location"
6. Entrer latitude/longitude
7. Rafraîchir la page /map
```

---

## 📊 Vérifier que ça fonctionne

### Console Backend (Terminal 1):
```bash
WebSocket server initialized
✅ User authenticated: <userId>
✅ User joined location: room_46.77_6.64
📍 Nearby pets found: 2
```

### Console Frontend (F12 → Console):
```javascript
// Vérifier connexion
wsService.isConnected  // true

// Écouter les événements
wsService.on('location:nearby-pets', (data) => {
  console.log('Pets à proximité:', data.pets);
});
```

### Interface MapView:
```
✅ Message "📍 Position actuelle: 46.778500, 6.641100"
✅ "Tamagotchis à proximité (2)"
✅ Cartes avec nom, stats, distance
✅ Indicateur 🟢 si propriétaire en ligne
```

---

## 🎮 Scénario de test complet

### Test 1: Toi seul
```
1. Connexion → Créer 2 Tamagotchis
2. /map → Activer géolocalisation
→ Tu vois tes 2 pets (distance: 0m)
```

### Test 2: Multi-onglets avec positions différentes
```
Onglet 1:
- DevTools position: 46.7785, 6.6411
- Login user1 → Créer pet1
- /map → Géolocalisation

Onglet 2 (privé):
- DevTools position: 46.7790, 6.6415
- Login user2 → Créer pet2
- /map → Géolocalisation

→ Chaque onglet voit 2 pets avec distance
→ 🟢 sur les deux (online)
```

### Test 3: Avec un collègue
```
Toi:
- Backend + frontend lancés
- Partager IP: 192.168.x.x
- Créer pet1
- /map

Collègue:
- Modifier .env avec ton IP
- npm run dev
- Créer compte + pet2
- /map

→ Vous vous voyez mutuellement !
```

---

## 🚨 Problèmes courants

### "Aucun Tamagotchi à proximité"

**Solutions:**
1. Augmenter le rayon (50km pour tests)
2. Vérifier les positions GPS dans DevTools
3. Vérifier qu'il y a bien d'autres pets créés
4. Rafraîchir la page

### "WebSocket non connecté"

**Solutions:**
```javascript
// Console navigateur
localStorage.getItem('token')  // Doit exister

// Se reconnecter
const authStore = useAuthStore();
authStore.logout();
authStore.login({ email: 'test@test.com', password: 'Test1234!' });
```

### "Géolocalisation refusée"

**Chrome:**
```
Click 🔒 → Paramètres du site → Localisation → Autoriser
```

**Firefox:**
```
Click (i) → Permissions → Localisation → Autoriser
```

---

## ✅ Après le push

### Pour que tes collègues testent:

1. **Ils clonent le repo:**
   ```bash
   git clone <repo-url>
   cd TamaGo
   ```

2. **Backend (UNE SEULE PERSONNE lance ça):**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Frontend (CHACUN lance ça):**
   
   Créer `.env`:
   ```env
   VITE_API_BASE_URL=http://IP_DU_SERVEUR:3000
   ```
   
   Puis:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Chacun:**
   - Va sur `http://localhost:5173`
   - Crée son compte
   - Crée son Tamagotchi
   - Va sur `/map`
   - Active la géolocalisation

5. **Si vous êtes dans le même bureau:**
   - Vous vous verrez automatiquement ! 🎉

6. **Si vous êtes éloignés:**
   - Modifier le rayon à 50km dans `MapView.vue`

---

## 🎯 Résumé

| Méthode | Difficulté | Setup | Réalisme |
|---------|-----------|-------|----------|
| Multi-onglets + DevTools | ⭐ Facile | 5 min | Moyen |
| Réseau local (collègues) | ⭐⭐ Moyen | 10 min | Élevé |
| Serveur distant (Heroku...) | ⭐⭐⭐ Avancé | 30 min | Production |

**Recommandation:** Commence par multi-onglets, puis teste avec un collègue en réseau local !

---

Bon test ! 🚀🗺️
