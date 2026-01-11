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
      return;
    }

    let WS_URL = import.meta.env.VITE_API_BASE_URL;
    
    // Déterminer l'URL du WebSocket
    if (!WS_URL) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.host;
      
      // Si on est en dev local, rester sur localhost:3000
      if (host.includes('localhost')) {
        WS_URL = 'http://localhost:3000';
      } else {
        // En production sur Render
        // Même domaine que le frontend, mais port 443 pour les WebSocket
        const wsPort = import.meta.env.VITE_WS_PORT || '443';
        
        if (wsPort === '443') {
          WS_URL = `${protocol}//${host}`;
        } else {
          WS_URL = `${protocol}//${host.split(':')[0]}:${wsPort}`;
        }
        
        console.log('🎯 Render environment detected, WS_URL:', WS_URL, 'WS Port:', wsPort);
      }
    }

    console.log('📡 Connecting to WebSocket:', WS_URL);

    this.socket = io(WS_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    // Événements de connexion
    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', WS_URL);
      this.isConnected = true;
      this.emit('connection:established');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
      this.emit('connection:lost');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket error:', error);
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
    this.socket.on('users:existing', (data) => {
      console.log('📊 users:existing reçu:', data);
      this.emit('users:existing', data);
    });

    this.socket.on('user:online', (data) => {
      console.log('🟢 user:online reçu:', data);
      this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
      console.log('🔴 user:offline reçu:', data);
      this.emit('user:offline', data);
    });

    // Localisation des utilisateurs
    this.socket.on('user:location', (data) => {
      console.log('📍 user:location reçu:', data);
      this.emit('user:location', data);
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
        // Error in listener
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
