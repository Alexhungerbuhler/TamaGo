import axios from 'axios';

// Configuration de base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Création de l'instance axios
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur de requête - Ajout automatique du token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tamago_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('tamago_auth_token');
      localStorage.removeItem('tamago_user');
      window.location.href = '/login';
    }
    
    // Gestion des erreurs serveur
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
    
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data
    });
  }
);

// ============================================
// Services Auth
// ============================================
export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register(name, password) {
    return apiClient.post('/auth/register', { name, password });
  },

  /**
   * Connexion d'un utilisateur
   */
  login(name, password) {
    return apiClient.post('/auth/login', { name, password });
  },

  /**
   * Déconnexion
   */
  logout() {
    return apiClient.post('/auth/logout');
  }
};

// ============================================
// Services Pets
// ============================================
export const petsService = {
  /**
   * Récupérer la liste des pets avec filtres optionnels
   * @param {Object} params - Paramètres de requête (userId, page, limit, sort)
   */
  list(params = {}) {
    return apiClient.get('/pets', { params });
  },

  /**
   * Créer un nouveau pet
   * @param {Object} petData - Données du pet (name, species, etc.)
   */
  create(petData) {
    return apiClient.post('/pets', petData);
  },

  /**
   * Récupérer un pet par son ID
   * @param {string} id - ID du pet
   */
  getById(id) {
    return apiClient.get(`/pets/${id}`);
  },

  /**
   * Supprimer un pet
   * @param {string} id - ID du pet
   */
  delete(id) {
    return apiClient.delete(`/pets/${id}`);
  },

  // Actions du pet
  /**
   * Nourrir le pet
   */
  feed(id) {
    return apiClient.post(`/pets/${id}/eat`);
  },

  /**
   * Emmener le pet aux toilettes
   */
  toilet(id) {
    return apiClient.post(`/pets/${id}/toilet`);
  },

  /**
   * Faire dormir le pet
   */
  sleep(id) {
    return apiClient.post(`/pets/${id}/sleep`);
  },

  /**
   * Jouer avec le pet
   */
  play(id) {
    return apiClient.post(`/pets/${id}/play`);
  },

  /**
   * Déplacer le pet
   * @param {string} id - ID du pet
   * @param {Object} location - {latitude, longitude}
   */
  move(id, location) {
    return apiClient.post(`/pets/${id}/move`, location);
  },

  /**
   * Récupérer les statistiques d'un pet
   */
  getStats(id) {
    return apiClient.get(`/pets/${id}/stats`);
  },

  /**
   * Upload d'une image pour un pet
   * @param {string} id - ID du pet
   * @param {File} imageFile - Fichier image
   */
  uploadImage(id, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiClient.post(`/pets/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Supprimer l'image d'un pet
   */
  deleteImage(id) {
    return apiClient.delete(`/pets/${id}/image`);
  }
};

// ============================================
// Services Stats
// ============================================
export const statsService = {
  /**
   * Récupérer les statistiques globales
   */
  getGlobal() {
    return apiClient.get('/stats');
  },

  /**
   * Récupérer les statistiques d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   */
  getUserStats(userId) {
    return apiClient.get(`/stats/users/${userId}`);
  }
};

// ============================================
// Services World
// ============================================
export const worldService = {
  /**
   * Récupérer la carte du monde
   */
  getMap() {
    return apiClient.get('/world/map');
  }
};

// ============================================
// Services Users (uploads avatar)
// ============================================
export const usersService = {
  /**
   * Upload d'un avatar utilisateur
   * @param {File} avatarFile - Fichier image
   */
  uploadAvatar(avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    return apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Supprimer l'avatar utilisateur
   */
  deleteAvatar() {
    return apiClient.delete('/users/avatar');
  }
};

// ============================================
// Service Tick
// ============================================
export const tickService = {
  /**
   * Déclencher manuellement un tick
   */
  trigger() {
    return apiClient.post('/tick');
  }
};

// Export de l'instance axios pour usage avancé si nécessaire
export default apiClient;
