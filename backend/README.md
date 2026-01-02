# TamaGo Backend API

API REST pour le jeu TamaGo - un Tamagotchi géolocalisé.

## 🚀 Démarrage

### Prérequis
- Node.js (v18+)
- MongoDB
- Compte Cloudinary (pour l'upload d'images)

### Installation

```bash
npm install
```

### Configuration

Créer un fichier `.env` à la racine avec les variables suivantes :

```env
DATABASE_URL=mongodb://localhost/tama-go
PORT=3000
SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Lancer le serveur

```bash
npm start        # Production
npm run dev      # Développement
```

### Tests

```bash
npm test         # Lancer les tests une fois
npm run test:watch  # Mode watch
```

## 📚 Documentation API

Base URL: `http://localhost:3000/api`

### 🔐 Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "username",
  "password": "password123"
}
```

**Réponse (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "username"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "name": "username",
  "password": "password123"
}
```

**Réponse (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "username",
    "avatarUrl": null
  }
}
```

**Codes d'erreur:**
- `400`: Paramètres manquants
- `401`: Identifiants invalides
- `409`: Nom d'utilisateur déjà pris (register)

---

### 👤 Utilisateurs

#### Upload Avatar
```http
POST /api/users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: (image file)
```

**Réponse (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

#### Supprimer Avatar
```http
DELETE /api/users/avatar
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "message": "Avatar deleted successfully"
}
```

---

### 🐾 Pets (Tamagotchis)

#### Lister les Pets (avec pagination et filtres)
```http
GET /api/pets?page=1&limit=10&userId={userId}&minLevel=1&maxHunger=50&name=fluffy
```

**Paramètres de requête:**
- `page` (number, défaut: 1): Numéro de page
- `limit` (number, défaut: 10): Nombre d'éléments par page
- `userId` (string): Filtrer par propriétaire
- `minLevel` / `maxLevel` (number): Filtrer par niveau
- `minHunger` / `maxHunger` (number): Filtrer par faim (0-100)
- `minEnergy` / `maxEnergy` (number): Filtrer par énergie (0-100)
- `name` (string): Recherche partielle par nom

**Réponse (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Fluffy",
      "owner": {
        "_id": "507f191e810c19729de860ea",
        "name": "username"
      },
      "level": 1,
      "hunger": 100,
      "hygiene": 100,
      "energy": 100,
      "fun": 100,
      "imageUrl": null,
      "location": {
        "type": "Point",
        "coordinates": [6.641, 46.781]
      },
      "createdAt": "2026-01-02T10:00:00.000Z",
      "updatedAt": "2026-01-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Créer un Pet
```http
POST /api/pets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Fluffy",
  "lat": 46.781,
  "lng": 6.641
}
```

**Réponse (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Fluffy",
  "owner": "507f191e810c19729de860ea",
  "level": 1,
  "hunger": 100,
  "hygiene": 100,
  "energy": 100,
  "fun": 100,
  "location": {
    "type": "Point",
    "coordinates": [6.641, 46.781]
  }
}
```

**Codes d'erreur:**
- `400`: Paramètres manquants
- `401`: Non authentifié

#### Obtenir un Pet
```http
GET /api/pets/{id}
```

**Réponse (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Fluffy",
  "owner": "507f191e810c19729de860ea",
  "level": 1,
  "hunger": 85,
  "hygiene": 90,
  "energy": 75,
  "fun": 80,
  "imageUrl": "https://res.cloudinary.com/...",
  "location": {
    "type": "Point",
    "coordinates": [6.641, 46.781]
  }
}
```

**Codes d'erreur:**
- `404`: Pet non trouvé

#### Supprimer un Pet
```http
DELETE /api/pets/{id}
Authorization: Bearer {token}
```

**Réponse (204):** Pas de contenu

**Codes d'erreur:**
- `401`: Non authentifié
- `403`: Vous n'êtes pas le propriétaire
- `404`: Pet non trouvé

---

### 🎮 Actions sur les Pets

Toutes ces actions nécessitent l'authentification et que vous soyez le propriétaire.

#### Nourrir
```http
POST /api/pets/{id}/eat
Authorization: Bearer {token}
```

**Effet:** hunger +30

**Réponse (200):** Pet mis à jour

#### Toilette
```http
POST /api/pets/{id}/toilet
Authorization: Bearer {token}
```

**Effet:** hygiene = 100

#### Dormir
```http
POST /api/pets/{id}/sleep
Authorization: Bearer {token}
```

**Effet:** energy +40, hunger -10

#### Jouer
```http
POST /api/pets/{id}/play
Authorization: Bearer {token}
```

**Effet:** fun +25, energy -20, hunger -15

#### Déplacer
```http
POST /api/pets/{id}/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "lat": 46.781,
  "lng": 6.641
}
```

**Réponse (200):** Pet avec nouvelle position

#### Obtenir les Stats
```http
GET /api/pets/{id}/stats
```

**Réponse (200):**
```json
{
  "hunger": 85,
  "hygiene": 90,
  "energy": 75,
  "fun": 80
}
```

---

### 🖼️ Images des Pets

#### Upload Image
```http
POST /api/pets/{id}/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: (image file, max 5MB)
```

**Réponse (200):**
```json
{
  "message": "Pet image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/..."
}
```

**Codes d'erreur:**
- `400`: Fichier manquant ou invalide
- `401`: Non authentifié
- `403`: Vous n'êtes pas le propriétaire
- `404`: Pet non trouvé

#### Supprimer Image
```http
DELETE /api/pets/{id}/image
Authorization: Bearer {token}
```

**Réponse (200):**
```json
{
  "message": "Pet image deleted successfully"
}
```

---

### 📊 Statistiques

#### Statistiques Globales
```http
GET /api/stats
```

**Réponse (200):**
```json
{
  "summary": {
    "totalPets": 150,
    "totalUsers": 45,
    "petsInDanger": 12
  },
  "petsPerUser": {
    "avgPetsPerUser": 3.33,
    "maxPetsPerUser": 10,
    "minPetsPerUser": 1
  },
  "averageStats": {
    "avgLevel": 2.5,
    "avgHunger": 67.3,
    "avgHygiene": 72.1,
    "avgEnergy": 68.9,
    "avgFun": 65.4,
    "maxLevel": 15
  },
  "levelDistribution": [
    { "_id": 1, "count": 80 },
    { "_id": 2, "count": 45 },
    { "_id": 3, "count": 25 }
  ],
  "topUsers": [
    {
      "userId": "507f191e810c19729de860ea",
      "userName": "player1",
      "petCount": 10,
      "totalLevel": 35,
      "avgHunger": 72.5
    }
  ]
}
```

#### Statistiques Utilisateur
```http
GET /api/stats/users/{userId}
Authorization: Bearer {token}
```

**Note:** Vous ne pouvez voir que vos propres statistiques.

**Réponse (200):**
```json
{
  "userId": "507f191e810c19729de860ea",
  "stats": {
    "totalPets": 5,
    "totalLevel": 12,
    "avgLevel": 2.4,
    "avgHunger": 75.5,
    "avgHygiene": 80.2,
    "avgEnergy": 70.1,
    "avgFun": 68.9,
    "highestLevel": 5
  },
  "petsInDanger": 1
}
```

**Codes d'erreur:**
- `401`: Non authentifié
- `403`: Vous ne pouvez voir que vos propres stats

---

### 🗺️ Monde

#### Carte du Monde
```http
GET /api/world/map
```

Retourne tous les pets avec leur position géographique.

**Réponse (200):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "petId": "507f1f77bcf86cd799439011",
        "name": "Fluffy",
        "level": 1,
        "owner": "username"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [6.641, 46.781]
      }
    }
  ]
}
```

---

### ⏱️ Système de Tick

#### Déclencher un Tick Manuel
```http
POST /api/tick
```

Décrémente les stats de tous les pets (simulation du temps qui passe).

**Réponse (200):**
```json
{
  "message": "Tick executed",
  "petsUpdated": 42
}
```

---

## 🏗️ Architecture

### Modèles de Données

#### User
```javascript
{
  name: String,           // Unique
  passwordHash: String,   // Hashed avec bcrypt
  avatarUrl: String,      // URL Cloudinary
  cloudinaryPublicId: String
}
```

#### Tamagotchi
```javascript
{
  name: String,           // Required
  owner: ObjectId,        // Référence vers User
  level: Number,          // Défaut: 1
  hunger: Number,         // 0-100, défaut: 100
  hygiene: Number,        // 0-100, défaut: 100
  energy: Number,         // 0-100, défaut: 100
  fun: Number,            // 0-100, défaut: 100
  imageUrl: String,       // URL Cloudinary
  cloudinaryPublicId: String,
  location: {
    type: "Point",
    coordinates: [lng, lat]  // GeoJSON format
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Index MongoDB

- `User.name`: Index unique
- `Tamagotchi.owner`: Index
- `Tamagotchi.location`: Index 2dsphere (géospatial)

---

## 🧪 Tests

Le projet inclut **17+ tests** couvrant :
- ✅ Authentification (register, login, erreurs)
- ✅ CRUD des pets (create, read, update, delete)
- ✅ Autorisation (propriété des pets)
- ✅ Pagination et filtrage
- ✅ Actions sur les pets
- ✅ Statistiques (globales et utilisateur)

Pour lancer les tests :
```bash
npm test
```

---

## 🔒 Sécurité

- **Authentification:** JWT (JSON Web Tokens)
- **Mots de passe:** Hachés avec bcrypt (cost factor: 10)
- **Autorisation:** Vérification du propriétaire pour toutes les actions sensibles
- **Validation:** Validation des inputs côté serveur
- **CORS:** À configurer selon vos besoins

---

## 📦 Dépendances Principales

- **express**: Framework web
- **mongoose**: ODM MongoDB
- **jsonwebtoken**: Authentification JWT
- **bcrypt**: Hachage de mots de passe
- **cloudinary**: Gestion d'images
- **multer**: Upload de fichiers
- **vitest**: Framework de tests
- **supertest**: Tests HTTP

---

## 🌐 Déploiement

### Variables d'environnement requises:
- `DATABASE_URL`: URL MongoDB
- `PORT`: Port du serveur (défaut: 3000)
- `SECRET_KEY`: Clé secrète pour JWT
- `CLOUDINARY_CLOUD_NAME`: Nom du cloud Cloudinary
- `CLOUDINARY_API_KEY`: Clé API Cloudinary
- `CLOUDINARY_API_SECRET`: Secret API Cloudinary

### Recommandations:
- Utiliser une base MongoDB Atlas pour la production
- Configurer CORS pour votre domaine frontend
- Utiliser HTTPS en production
- Définir un `SECRET_KEY` fort et unique

---

## 📝 Critères COMEM+ ArchiOWeb

### ✅ Fonctionnalités Implémentées

- [x] **User registration & login** avec JWT
- [x] **2+ types de ressources** (User, Tamagotchi)
- [x] **Authentification JWT** sur endpoints sensibles
- [x] **Autorisation/Permissions** (ownership checks)
- [x] **Pagination** (page, limit, total, pages)
- [x] **Filtrage avancé** (level, stats, name, userId)
- [x] **Agrégation MongoDB** (stats globales, par user, top users, distribution)
- [x] **Géolocalisation** (2dsphere index, coordinates)
- [x] **Upload d'images** (Cloudinary pour avatars et pets)
- [x] **Tests automatisés** (17+ tests avec Vitest)
- [x] **Documentation API complète** (ce README)
- [x] **Code quality** (structure modulaire, gestion d'erreurs)

### 📈 Points Bonus Potentiels

- Agrégations MongoDB complexes avec $lookup
- Filtrage géospatial possible (infrastructure en place)
- Upload d'images avec validation et limites
- Tests couvrant authentification, autorisation, CRUD, agrégation

---

## 🤝 Contribution

Joshua Abessolo - COMEM+ ArchiOWeb 2026

---

## 📄 Licence

Privé - Projet académique
