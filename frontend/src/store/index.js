import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/api';
import wsService from '../services/websocket';

const TOKEN_KEY = 'tamago_auth_token';
const USER_KEY = 'tamago_user';

// Fonction pour normaliser l'objet user (convertir _id en id si nécessaire)
function normalizeUser(userData) {
  if (!userData) return null;
  
  // Si l'user a _id mais pas id, normaliser
  if (userData._id && !userData.id) {
    return {
      ...userData,
      id: userData._id
    };
  }
  
  return userData;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem(TOKEN_KEY) || null);
  const user = ref(normalizeUser(JSON.parse(localStorage.getItem(USER_KEY) || 'null')));
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const currentUser = computed(() => user.value);

  // Actions
  function setAuth(authToken, userData) {
    token.value = authToken;
    user.value = normalizeUser(userData);
    
    // Persistance localStorage
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(userData)));
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    
    // Nettoyage localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(name, password) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(name, password);
      const data = response.data;
      
      // Stockage du token et des données utilisateur
      // data.user contient { _id, name, ... }
      setAuth(data.token, { name: data.user.name, id: data.user._id });
      
      // Connexion WebSocket
      wsService.connect(data.token);
      
      return data;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la connexion';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(name, password) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.register(name, password);
      const data = response.data;
      
      // data contient directement l'utilisateur créé { _id, name }
      // Pas de token car il faut se connecter après inscription
      // On ne fait PAS d'auto-login ici
      
      return data;
    } catch (err) {
      error.value = err.message || 'Erreur lors de l\'inscription';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Déconnexion WebSocket
      wsService.disconnect();
      clearAuth();
      error.value = null;
    }
  }

  // Vérification du token au démarrage
  function checkAuth() {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedToken && savedUser) {
      
      // Reconnexion WebSocket automatique
      wsService.connect(savedToken);
      token.value = savedToken;
      user.value = normalizeUser(JSON.parse(savedUser));
    }
  }

  // Initialisation
  checkAuth();

  return {
    // State
    token,
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    currentUser,
    
    // Actions
    login,
    register,
    logout,
    setAuth,
    clearAuth,
    checkAuth
  };
});