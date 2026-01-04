# 🎯 Guide d'Utilisation - Store Auth Pinia

## 🚀 Démarrage Rapide

### 1. Démarrer MongoDB (si pas déjà fait)
\`\`\`bash
brew services start mongodb/brew/mongodb-community@8.0
\`\`\`

### 2. Démarrer le Backend
\`\`\`bash
cd backend
npm run dev
# Le backend tourne sur http://localhost:3000
\`\`\`

### 3. Démarrer le Frontend
\`\`\`bash
cd frontend
npm run dev
# Le frontend tourne sur http://localhost:5173
\`\`\`

## 💡 Comment utiliser le Store Auth dans tes composants

### Importer le store
\`\`\`vue
<script setup>
import { useAuthStore } from '../store';

const authStore = useAuthStore();
</script>
\`\`\`

### Vérifier si l'utilisateur est connecté
\`\`\`vue
<template>
  <div v-if="authStore.isAuthenticated">
    <p>Connecté en tant que: {{ authStore.currentUser.name }}</p>
  </div>
  <div v-else>
    <p>Non connecté</p>
  </div>
</template>
\`\`\`

### Se connecter
\`\`\`vue
<script setup>
import { useAuthStore } from '../store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function login() {
  try {
    await authStore.login('username', 'password');
    // Connexion réussie, redirection
    router.push('/');
  } catch (error) {
    // Erreur déjà dans authStore.error
    console.error('Login failed:', authStore.error);
  }
}
</script>
\`\`\`

### S'inscrire
\`\`\`vue
<script setup>
import { useAuthStore } from '../store';

const authStore = useAuthStore();

async function register() {
  try {
    await authStore.register('newuser', 'password123');
    // Inscription réussie, l'utilisateur est auto-connecté
  } catch (error) {
    console.error('Register failed:', authStore.error);
  }
}
</script>
\`\`\`

### Se déconnecter
\`\`\`vue
<script setup>
import { useAuthStore } from '../store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>
\`\`\`

### Afficher les erreurs
\`\`\`vue
<template>
  <div v-if="authStore.error" class="error">
    {{ authStore.error }}
  </div>
</template>
\`\`\`

### Afficher le loading
\`\`\`vue
<template>
  <button :disabled="authStore.loading">
    {{ authStore.loading ? 'Chargement...' : 'Se connecter' }}
  </button>
</template>
\`\`\`

## 🔐 LocalStorage - Persistance automatique

Le store gère automatiquement :
- ✅ Sauvegarde du token dans `localStorage` à la connexion
- ✅ Sauvegarde des données utilisateur
- ✅ Rechargement automatique au démarrage de l'app
- ✅ Nettoyage à la déconnexion

Tu n'as **rien à faire** ! Tout est automatique.

### Vérifier dans le navigateur
1. Ouvre DevTools (F12)
2. Onglet "Application"
3. Section "Local Storage" > http://localhost:5173
4. Tu verras:
   - `tamago_auth_token` - Le JWT
   - `tamago_user` - Les données utilisateur (JSON)

## 📊 Propriétés disponibles du Store

### State
| Propriété | Type | Description |
|-----------|------|-------------|
| `token` | string \| null | Token JWT |
| `user` | object \| null | Données utilisateur |
| `loading` | boolean | État de chargement |
| `error` | string \| null | Message d'erreur |

### Getters
| Getter | Type | Description |
|--------|------|-------------|
| `isAuthenticated` | boolean | True si connecté |
| `currentUser` | object \| null | Utilisateur actuel |

### Actions
| Action | Paramètres | Description |
|--------|-----------|-------------|
| `login()` | name, password | Connexion |
| `register()` | name, password | Inscription |
| `logout()` | - | Déconnexion |
| `setAuth()` | token, user | Définir l'auth manuellement |
| `clearAuth()` | - | Nettoyer l'auth |
| `checkAuth()` | - | Vérifier l'auth (auto au démarrage) |

## 🎯 Exemples concrets

### Exemple 1: Bouton de connexion/déconnexion
\`\`\`vue
<template>
  <button v-if="authStore.isAuthenticated" @click="logout">
    Déconnexion ({{ authStore.currentUser.name }})
  </button>
  <button v-else @click="$router.push('/login')">
    Connexion
  </button>
</template>

<script setup>
import { useAuthStore } from '../store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/');
}
</script>
\`\`\`

### Exemple 2: Protéger un composant
\`\`\`vue
<template>
  <div v-if="!authStore.isAuthenticated">
    <p>Vous devez être connecté pour accéder à cette page</p>
    <router-link to="/login">Se connecter</router-link>
  </div>
  
  <div v-else>
    <!-- Contenu protégé -->
    <h1>Page privée</h1>
    <p>Bienvenue {{ authStore.currentUser.name }} !</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store';

const authStore = useAuthStore();
</script>
\`\`\`

### Exemple 3: Formulaire avec gestion d'erreur
\`\`\`vue
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="username" placeholder="Nom d'utilisateur" />
    <input v-model="password" type="password" placeholder="Mot de passe" />
    
    <p v-if="authStore.error" class="error">
      {{ authStore.error }}
    </p>
    
    <button :disabled="authStore.loading">
      {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (error) {
    // L'erreur est déjà affichée via authStore.error
  }
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
}
</style>
\`\`\`

## 🐛 Debugging

### Voir l'état du store en temps réel
\`\`\`vue
<script setup>
import { useAuthStore } from '../store';
import { watch } from 'vue';

const authStore = useAuthStore();

// Log tous les changements
watch(() => authStore.isAuthenticated, (newVal) => {
  console.log('Auth changed:', newVal);
});

watch(() => authStore.error, (newVal) => {
  console.log('Error:', newVal);
});
</script>
\`\`\`

### Inspecter dans Vue DevTools
1. Installer Vue DevTools (extension Chrome/Firefox)
2. Ouvrir DevTools
3. Onglet "Vue"
4. Section "Pinia" → Tu verras ton store `auth` avec toutes les propriétés

## ✅ Checklist de test

- [ ] Connexion avec utilisateur existant
- [ ] Token sauvegardé dans localStorage
- [ ] Rafraîchir la page → Reste connecté
- [ ] Déconnexion → localStorage nettoyé
- [ ] Connexion avec mauvais identifiants → Erreur affichée
- [ ] Inscription d'un nouvel utilisateur
- [ ] Auto-connexion après inscription

## 🚀 Prochaines étapes

Maintenant que l'auth fonctionne, tes collègues peuvent :

1. **Service API** - Créer des fonctions pour appeler tous les endpoints
2. **Router Guards** - Protéger automatiquement les routes
3. **Store Tamagotchis** - Gérer les Tamagotchis comme l'auth
4. **WebSocket** - Temps réel avec le token dans les headers

Bon courage ! 💪
