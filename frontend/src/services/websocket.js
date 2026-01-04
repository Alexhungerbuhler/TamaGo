import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Se connecter au serveur WebSocket
   * @param {string} token - Token JWT d'authentification
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const WS_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    this.socket = io(WS_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.emit('connection:established');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
      this.emit('connection:lost');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.emit('connection:error', error);
    });

    // Événements du serveur
    this.setupServerListeners();
  }

  /**
   * Configuration des écouteurs d'événements du serveur
   */
  setupServerListeners() {
    // Utilisateurs online/offline
    this.socket.on('user:online', (data) => {
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      this.emit('user:offline', data);
    });

    // Mise à jour des pets
    this.socket.on('pet:updated', (data) => {
      this.emit('pet:updated', data);
    });

    this.socket.on('pet:moved', (data) => {
      this.emit('pet:moved', data);
    });

    // Alertes
    this.socket.on('pet:alert', (data) => {
      this.emit('pet:alert', data);
    });

    this.socket.on('pet:critical', (data) => {
      this.emit('pet:critical', data);
    });

    // Localisation
    this.socket.on('location:nearby-pets', (data) => {
      this.emit('location:nearby-pets', data);
    });

    // Erreurs
    this.socket.on('error', (data) => {
      this.emit('error', data);
    });
  }

  /**
   * Se déconnecter du serveur WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Rejoindre une zone géographique
   * @param {Object} location - {latitude, longitude, radius}
   */
  joinLocation(location) {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return;
    }
    this.socket.emit('location:join', location);
  }

  /**
   * Quitter la zone géographique actuelle
   */
  leaveLocation() {
    if (!this.isConnected) return;
    this.socket.emit('location:leave');
  }

  /**
   * Mettre à jour la position d'un pet
   * @param {string} petId - ID du pet
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   */
  updatePetLocation(petId, latitude, longitude) {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return;
    }
    this.socket.emit('location:update', { petId, latitude, longitude });
  }

  /**
   * Vérifier la santé des pets
   */
  checkPetHealth() {
    if (!this.isConnected) return;
    this.socket.emit('pet:check-health');
  }

  /**
   * Ajouter un écouteur d'événements
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner une fonction pour se désabonner
    return () => this.off(event, callback);
  }

  /**
   * Retirer un écouteur d'événements
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Fonction de callback
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Émettre un événement vers les écouteurs locaux
   * @param {string} event - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket listener for ${event}:`, error);
      }
    });
  }

  /**
   * Vérifier si connecté
   */
  get connected() {
    return this.isConnected;
  }
}

// Instance singleton
const wsService = new WebSocketService();

export default wsService;
