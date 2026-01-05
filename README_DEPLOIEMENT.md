# 🚀 Guide de démarrage - Backend + Frontend

Ce guide explique comment lancer le backend et le frontend simultanément.

## 📦 Installation

### Option 1 : Installation automatique (recommandé)

À la racine du projet, exécutez :

```bash
npm run install:all
```

Cette commande installera toutes les dépendances (racine, backend et frontend).

### Option 2 : Installation manuelle

```bash
# Installer les dépendances de la racine
npm install

# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

---

## 🎯 Lancer les deux services

### Méthode 1 : Avec npm (recommandé)

À la racine du projet :

```bash
npm run dev
```

Cette commande lance automatiquement le backend et le frontend en parallèle.

### Méthode 2 : Avec le script Node.js

```bash
node start-dev.js
```

### Méthode 3 : Manuellement (dans deux terminaux)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

---

## 📝 Scripts disponibles

À la racine du projet, vous avez accès à ces scripts :

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le backend ET le frontend en parallèle |
| `npm run dev:backend` | Lance uniquement le backend |
| `npm run dev:frontend` | Lance uniquement le frontend |
| `npm run install:all` | Installe toutes les dépendances |
| `npm run build` | Build le frontend pour la production |
| `npm start` | Lance les services en mode production |

---

## 🔧 Configuration

### Variables d'environnement

#### Backend (`backend/.env`)
```env
DATABASE_URL=mongodb://localhost/tama-go
SECRET_KEY=votre-clé-secrète
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🌐 URLs par défaut

- **Backend** : http://localhost:3000
- **Frontend** : http://localhost:5173

---

## 🛑 Arrêter les services

Appuyez sur **Ctrl+C** dans le terminal où les services tournent.

---

## 🐛 Dépannage

### Erreur "concurrently not found"
```bash
npm install
```

### Le backend ne démarre pas
- Vérifiez que MongoDB est démarré
- Vérifiez les variables d'environnement dans `backend/.env`

### Le frontend ne se connecte pas au backend
- Vérifiez que le backend tourne sur le port 3000
- Vérifiez que `VITE_API_BASE_URL` est correct dans `frontend/.env`

### Port déjà utilisé
- Changez le port dans les variables d'environnement
- Ou arrêtez le processus qui utilise le port

---

## 📚 Pour plus d'informations

- Backend : Voir `backend/README.md`
- Frontend : Voir `frontend/README.md`

