import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/api';
import wsService from '../services/websocket';

const TOKEN_KEY = 'tamago_auth_token';
const USER_KEY = 'tamago_user';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem(TOKEN_KEY) || null);
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const currentUser = computed(() => user.value);

  // Actions
  function setAuth(authToken, userData) {
    token.value = authToken;
    user.value = userData;
    
    // Persistance localStorage
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
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
      setAuth(data.token, { name, id: data.userId || data.user?.id });
      
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
      
      // Auto-login après inscription
      if (data.token) {
        setAuth(data.token, { name, id: data.userId || data.user?.id });
      }
      
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
      user.value = JSON.parse(savedUser);
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