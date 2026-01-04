# ✅ Guide de Test des Routes API Backend-Frontend

## Configuration actuelle

### Backend
- **Port** : 3000
- **Base URL** : `http://localhost:3000`
- **Routes montées sur** : `/api`
- **CORS autorisé pour** : `http://localhost:5173`

### Frontend
- **Port** : 5173
- **API Base URL** : `http://localhost:3000/api`

## ✅ Checklist de vérification

### 1. Démarrer le backend
```bash
cd backend
npm start
```

**Vérifications** :
- [ ] Le serveur démarre sur le port 3000
- [ ] Message "Mongoose connected to..." apparaît
- [ ] Aucune erreur de connexion MongoDB

### 2. Tester le backend directement

#### Test avec curl (dans un terminal)
```bash
# Test de santé de l'API
curl http://localhost:3000/api

# Devrait retourner: "API OK"
```

#### Test avec le navigateur
Ouvrez : `http://localhost:3000/api`
- **Résultat attendu** : "API OK"

### 3. Tester l'inscription (backend seul)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"test123"}'
```

**Résultat attendu** :
- Code 201 si succès
- Code 409 si l'utilisateur existe déjà

### 4. Démarrer le frontend
```bash
cd frontend
npm run dev
```

**Vérifications** :
- [ ] Le serveur démarre sur le port 5173
- [ ] Aucune erreur de compilation
- [ ] Pas d'erreurs dans la console

### 5. Tester via ApiTestPanel

#### Accès
Allez sur : `http://localhost:5173/test-api`

#### Tests à effectuer dans l'ordre

**Test 1 : Inscription** ✅
1. Cliquez sur "S'inscrire"
2. **Résultat attendu** : "✅ Inscription réussie!"
3. **Dans la console DevTools (F12)** :
   - Requête : `POST http://localhost:3000/api/auth/register`
   - Status : 201 Created

**Test 2 : Connexion** ✅
1. Modifiez le nom d'utilisateur pour correspondre à celui créé
2. Cliquez sur "Se connecter"
3. **Résultat attendu** : "✅ Connexion réussie! Token: ..."
4. **Dans la console DevTools** :
   - Requête : `POST http://localhost:3000/api/auth/login`
   - Status : 200 OK

**Test 3 : Créer un pet** ✅
1. Entrez un nom de pet
2. Sélectionnez une espèce
3. Cliquez sur "Créer un pet"
4. **Résultat attendu** : JSON du pet créé
5. **Dans la console DevTools** :
   - Requête : `POST http://localhost:3000/api/pets`
   - Status : 201 Created
   - Header : `Authorization: Bearer <token>`

**Test 4 : Actions sur le pet** ✅
1. Cliquez sur "🍔 Nourrir"
2. **Résultat attendu** : JSON avec nouvelles stats
3. **Dans la console DevTools** :
   - Requête : `POST http://localhost:3000/api/pets/:id/eat`
   - Status : 200 OK

**Test 5 : Stats globales** ✅
1. Cliquez sur "Récupérer les stats globales"
2. **Résultat attendu** : JSON avec statistiques
3. **Dans la console DevTools** :
   - Requête : `GET http://localhost:3000/api/stats`
   - Status : 200 OK

## 🔍 Vérification dans la console du navigateur

Ouvrez DevTools (F12) → Onglet "Réseau" (Network)

Pour chaque requête, vérifiez :
- ✅ **URL correcte** : `http://localhost:3000/api/...`
- ✅ **Status** : 200, 201, etc. (pas 404 ou 500)
- ✅ **Headers** :
  - `Content-Type: application/json`
  - `Authorization: Bearer ...` (pour routes protégées)
- ✅ **Response** : Données JSON valides

## ❌ Problèmes courants et solutions

### Erreur CORS
```
Access to fetch at 'http://localhost:3000/api/...' has been blocked by CORS
```
**Solution** :
- Vérifiez que le backend a bien `cors` installé
- Vérifiez dans `backend/src/app.js` que CORS autorise `http://localhost:5173`
- Redémarrez le backend

### Erreur 404 Not Found
```
POST http://localhost:3000/api/auth/login 404
```
**Causes possibles** :
- Backend pas démarré
- Mauvaise URL (vérifier `/api` dans le chemin)

**Solution** :
- Démarrez le backend : `cd backend && npm start`
- Vérifiez que le backend répond sur `http://localhost:3000/api`

### Erreur 401 Unauthorized
```
POST http://localhost:3000/api/pets 401
```
**Cause** : Token manquant ou invalide

**Solution** :
- Connectez-vous d'abord (pour obtenir un token)
- Le token est automatiquement ajouté par l'intercepteur axios

### Erreur Network Error
```
Network Error
```
**Causes** :
- Backend pas démarré
- Mauvaise URL dans `.env`
- Problème de connexion

**Solution** :
1. Vérifiez que le backend tourne
2. Vérifiez `.env` : `VITE_API_BASE_URL=http://localhost:3000`
3. Redémarrez le frontend après modification du `.env`

## 📊 Table de correspondance des routes

| Action | Frontend appelle | Backend route | Auth requise |
|--------|------------------|---------------|--------------|
| **Inscription** | `/auth/register` | `POST /api/auth/register` | ❌ |
| **Connexion** | `/auth/login` | `POST /api/auth/login` | ❌ |
| **Déconnexion** | `/auth/logout` | `POST /api/auth/logout` | ❌ |
| **Liste pets** | `/pets` | `GET /api/pets` | ❌ (optionnel) |
| **Créer pet** | `/pets` | `POST /api/pets` | ✅ |
| **Get pet** | `/pets/:id` | `GET /api/pets/:id` | ❌ |
| **Supprimer pet** | `/pets/:id` | `DELETE /api/pets/:id` | ✅ |
| **Nourrir** | `/pets/:id/eat` | `POST /api/pets/:id/eat` | ✅ |
| **Jouer** | `/pets/:id/play` | `POST /api/pets/:id/play` | ✅ |
| **Dormir** | `/pets/:id/sleep` | `POST /api/pets/:id/sleep` | ✅ |
| **Toilette** | `/pets/:id/toilet` | `POST /api/pets/:id/toilet` | ✅ |
| **Déplacer** | `/pets/:id/move` | `POST /api/pets/:id/move` | ✅ |
| **Stats pet** | `/pets/:id/stats` | `GET /api/pets/:id/stats` | ❌ |
| **Stats globales** | `/stats` | `GET /api/stats` | ❌ |
| **Stats user** | `/stats/users/:id` | `GET /api/stats/users/:id` | ✅ |
| **Upload avatar** | `/users/avatar` | `POST /api/users/avatar` | ✅ |
| **Upload pet image** | `/pets/:id/image` | `POST /api/pets/:id/image` | ✅ |
| **World map** | `/world/map` | `GET /api/world/map` | ❌ |
| **Trigger tick** | `/tick` | `POST /api/tick` | ❌ |

## 🧪 Script de test rapide

Créez un fichier `test-api.sh` :

```bash
#!/bin/bash

echo "🧪 Test des routes API"
echo ""

# Test 1: Health check
echo "1️⃣ Test Health Check"
curl -s http://localhost:3000/api
echo -e "\n"

# Test 2: Register
echo "2️⃣ Test Register"
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test_'$(date +%s)'","password":"test123"}'
echo -e "\n"

# Test 3: Login
echo "3️⃣ Test Login"
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"test123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo -e "\n"

# Test 4: List pets
echo "4️⃣ Test List Pets"
curl -s http://localhost:3000/api/pets
echo -e "\n"

# Test 5: Stats
echo "5️⃣ Test Global Stats"
curl -s http://localhost:3000/api/stats
echo -e "\n"

echo "✅ Tests terminés"
```

Exécutez : `bash test-api.sh`

## ✅ Validation finale

Si tous ces points sont verts, votre API est correctement configurée :

- [ ] Backend démarre sans erreur
- [ ] `http://localhost:3000/api` retourne "API OK"
- [ ] Inscription fonctionne (via curl ou ApiTestPanel)
- [ ] Connexion fonctionne et retourne un token
- [ ] Création de pet fonctionne (avec token)
- [ ] Actions sur pet fonctionnent
- [ ] Stats globales retournent des données
- [ ] Aucune erreur CORS dans la console frontend
- [ ] Toutes les routes du tableau ci-dessus sont accessibles

## 📝 Notes importantes

1. **Token JWT** : Valable 7 jours par défaut
2. **CORS** : Configuré pour `http://localhost:5173` uniquement
3. **Base URL** : Toujours `/api` comme préfixe
4. **MongoDB** : Doit être connectée pour que le backend fonctionne
5. **Intercepteur axios** : Ajoute automatiquement le token aux requêtes authentifiées

---

**Votre configuration est correcte si vous pouvez faire tout le workflow suivant :**
1. S'inscrire → 2. Se connecter → 3. Créer un pet → 4. Interagir avec le pet → 5. Voir les stats
