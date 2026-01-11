import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import wsService from '../services/websocket';

// Variable globale pour éviter les doublons d'écouteurs
let listenersInitialized = false;

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref([]);
  const maxNotifications = 50;

  // Getters
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  );

  const criticalNotifications = computed(() =>
    notifications.value.filter(n => n.level === 'critical' && !n.read)
  );

  const hasUnread = computed(() => unreadCount.value > 0);

  // Actions
  function addNotification(notification) {
    // Vérifier si une notification identique existe déjà (même message + même petId + moins de 2 secondes)
    const now = Date.now();
    const isDuplicate = notifications.value.some(n => {
      const timeDiff = now - new Date(n.timestamp).getTime();
      return n.message === notification.message && 
             n.petId === notification.petId && 
             timeDiff < 2000; // Moins de 2 secondes
    });
    
    if (isDuplicate) {
      return null;
    }
    
    const newNotif = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    notifications.value.unshift(newNotif);

    // Limiter le nombre de notifications
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications);
    }

    // Afficher une notification navigateur si disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      showBrowserNotification(newNotif);
    }

    return newNotif;
  }

  function markAsRead(id) {
    const notif = notifications.value.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true);
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clearAll() {
    notifications.value = [];
  }

  function clearRead() {
    notifications.value = notifications.value.filter(n => !n.read);
  }

  function showBrowserNotification(notif) {
    const title = notif.title || 'TamaGo Notification';
    const options = {
      body: notif.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notif.id,
      requireInteraction: notif.level === 'critical'
    };

    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      markAsRead(notif.id);
      notification.close();
    };
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Écouter les notifications WebSocket en temps réel
  function setupWebSocketListeners() {
    // N'enregistrer les écouteurs qu'une seule fois
    if (listenersInitialized) {
      return;
    }
    
    wsService.on('notification:new', (data) => {
      addNotification(data);
    });
    
    listenersInitialized = true;
  }

  // Initialiser les écouteurs au chargement du store
  setupWebSocketListeners();

  return {
    // State
    notifications,
    
    // Getters
    unreadCount,
    criticalNotifications,
    hasUnread,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    requestNotificationPermission
  };
});