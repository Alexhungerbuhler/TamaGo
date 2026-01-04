# Configuration des Services API - TamaGo Frontend

## ✅ Ce qui a été mis en place

### 1. **Client Axios configuré** ([src/services/api.js](src/services/api.js))
- ✅ Instance axios avec baseURL depuis `VITE_API_BASE_URL`
- ✅ Headers par défaut (`Content-Type: application/json`)
- ✅ Export par défaut de l'instance pour usage avancé

### 2. **Intercepteurs JWT**
#### Intercepteur de requête
- ✅ Récupération automatique du token depuis `localStorage` (`tamago_auth_token`)
- ✅ Ajout du header `Authorization: Bearer <token>` à chaque requête

#### Intercepteur de réponse
- ✅ Gestion des erreurs 401 (redirection automatique vers `/login`)
- ✅ Nettoyage du localStorage en cas d'expiration du token
- ✅ Formatage des erreurs avec `status`, `message` et `data`

### 3. **Services API disponibles**

#### **authService**
- `register(name, password)` - Inscription
- `login(name, password)` - Connexion
- `logout()` - Déconnexion

#### **petsService**
- `list(params)` - Liste avec filtres (userId, page, limit, sort)
- `create(petData)` - Créer un pet
- `getById(id)` - Récupérer un pet
- `delete(id)` - Supprimer un pet
- `feed(id)` - Nourrir
- `toilet(id)` - Toilettes
- `sleep(id)` - Dormir
- `play(id)` - Jouer
- `move(id, location)` - Déplacer
- `getStats(id)` - Statistiques du pet
- `uploadImage(id, file)` - Upload image
- `deleteImage(id)` - Supprimer image

#### **statsService**
- `getGlobal()` - Statistiques globales
- `getUserStats(userId)` - Statistiques utilisateur

#### **worldService**
- `getMap()` - Carte du monde

#### **usersService**
- `uploadAvatar(file)` - Upload avatar
- `deleteAvatar()` - Supprimer avatar

#### **tickService**
- `trigger()` - Déclencher un tick manuel

### 4. **Stores Pinia**

#### **useAuthStore** ([src/store/index.js](src/store/index.js))
- ✅ Migré de `fetch` vers `authService`
- ✅ Gestion du token et de l'utilisateur
- ✅ Persistance localStorage
- ✅ Actions: `login()`, `register()`, `logout()`

#### **usePetsStore** ([src/store/pets.js](src/store/pets.js)) - NOUVEAU
- État: `pets`, `currentPet`, `loading`, `error`, `pagination`
- Actions complètes pour toutes les opérations CRUD
- Actions pour toutes les interactions (feed, play, sleep, toilet, move)
- Gestion de la pagination
- Upload/suppression d'images

#### **useStatsStore** ([src/store/stats.js](src/store/stats.js)) - NOUVEAU
- État: `globalStats`, `userStats`
- Actions: `fetchGlobalStats()`, `fetchUserStats()`, `refreshAllStats()`

### 5. **Composant exemple**
- ✅ [PetsList.vue](src/components/PetsList.vue) - Exemple complet d'utilisation

## 📋 Prochaines étapes recommandées

### Phase 1: Composants de base
1. **TamagotchiDetail.vue** - Vue détaillée d'un pet
   - Affichage complet des stats
   - Actions (feed, play, sleep, toilet)
   - Upload d'image
   - Historique des actions

2. **StatsDisplay.vue** - Composant réutilisable pour afficher les stats
   - Barres de progression
   - Icônes
   - Animations

3. **CreatePetForm.vue** - Formulaire de création standalone
   - Validation
   - Sélection d'espèce
   - Preview

### Phase 2: Features avancées
1. **MapView.vue** - Carte interactive
   - Affichage de la world map
   - Positionnement des pets
   - Déplacement interactif

2. **UserProfile.vue** - Profil utilisateur
   - Affichage des stats utilisateur
   - Upload avatar
   - Liste de tous les pets

3. **GlobalStats.vue** - Dashboard des stats globales
   - Graphiques
   - Classements
   - Agrégations

### Phase 3: Temps réel
1. **WebSocket ou Polling**
   - Auto-refresh des stats
   - Notifications
   - Synchronisation

2. **Animations Canvas**
   - Visualisation du pet
   - Animations d'actions
   - Effets visuels

## 🧪 Comment tester

### Test manuel dans un composant
```vue
<script setup>
import { petsService } from '@/services/api';
import { onMounted } from 'vue';

onMounted(async () => {
  try {
    const { data } = await petsService.list();
    console.log('Pets:', data);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
});
</script>
```

### Test dans la console navigateur
```javascript
// Après avoir importé les services dans un composant
import { petsService } from '@/services/api';

// Lister les pets
petsService.list().then(res => console.log(res.data));

// Créer un pet (nécessite auth)
petsService.create({ name: 'Test', species: 'cat' })
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

## 🔧 Configuration

### Fichier .env (déjà présent)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Variables Render (production)
```
VITE_API_BASE_URL=https://votre-backend.onrender.com
```

## 📚 Documentation

- [README Services API](src/services/README.md) - Guide complet d'utilisation
- Code commenté avec JSDoc
- Exemples d'utilisation dans chaque store

## ⚠️ Points d'attention

1. **Gestion des erreurs** : Toujours utiliser `try/catch`
2. **Loading states** : Afficher un indicateur pendant les requêtes
3. **Token expiration** : Géré automatiquement par l'intercepteur
4. **CORS** : Vérifier la config backend si problèmes
5. **Uploads** : Utiliser `FormData` pour les fichiers

## 🎯 Checklist de validation

- [x] Client axios configuré
- [x] Intercepteurs JWT fonctionnels
- [x] Services auth créés
- [x] Services pets créés
- [x] Services stats créés
- [x] Store auth migré vers axios
- [x] Store pets créé
- [x] Store stats créé
- [x] Composant exemple créé
- [x] Documentation complète
- [ ] Tests du frontend avec le backend
- [ ] Gestion des erreurs réseau testée
- [ ] Upload de fichiers testé
- [ ] Pagination testée

## 🚀 Pour démarrer

1. Vérifier que le backend tourne sur `http://localhost:3000`
2. Lancer le frontend: `npm run dev`
3. Tester la connexion/inscription
4. Créer un pet
5. Tester les actions sur le pet
