<template>
  <div v-if="shouldShowNotifications" class="notifications-container">
    <TransitionGroup name="notification">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="['notification', `notification-${notif.level}`]"
        :style="{ transform: swipeState[notif.id] ? `translateX(${swipeState[notif.id]}px)` : '' }"
        @touchstart="handleTouchStart($event, notif.id)"
        @touchmove="handleTouchMove($event, notif.id)"
        @touchend="handleTouchEnd($event, notif.id)"
      >
        <div class="notification-header">
          <span class="notification-title">{{ notif.title }}</span>
          <button class="notification-close" @click.stop="remove(notif.id)">
            <img src="/icons/CroixNotif.svg" alt="Close" class="close-icon">
          </button>
        </div>
        <div class="notification-body">
          {{ notif.message }}
        </div>
        <div class="notification-time">
          {{ formatTime(notif.timestamp) }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useNotificationsStore } from '../store/notifications';

const route = useRoute();
const notificationsStore = useNotificationsStore();

const notifications = computed(() => 
  notificationsStore.notifications.slice(0, 5)
);

// Ne pas afficher les notifications sur login et register
const shouldShowNotifications = computed(() => {
  return route.path !== '/login' && route.path !== '/register';
});

// Gestion du swipe
const swipeState = ref({});
const touchStartX = ref({});

function handleTouchStart(event, id) {
  touchStartX.value[id] = event.touches[0].clientX;
  swipeState.value[id] = 0;
}

function handleTouchMove(event, id) {
  if (!touchStartX.value[id]) return;
  
  const currentX = event.touches[0].clientX;
  const diff = currentX - touchStartX.value[id];
  
  // Autoriser uniquement le swipe vers la droite
  if (diff > 0) {
    swipeState.value[id] = diff;
  }
}

function handleTouchEnd(event, id) {
  const distance = swipeState.value[id] || 0;
  
  // Si le swipe dépasse 100px, animer la sortie complète puis supprimer
  if (distance > 100) {
    // Animer la sortie complète hors écran (largeur de la fenêtre entière)
    swipeState.value[id] = window.innerWidth;
    // Supprimer après l'animation (200ms)
    setTimeout(() => {
      remove(id);
      delete swipeState.value[id];
    }, 200);
  } else {
    // Sinon, revenir à la position initiale
    swipeState.value[id] = 0;
  }
  
  delete touchStartX.value[id];
}

function markAsRead(id) {
  notificationsStore.markAsRead(id);
}

function remove(id) {
  notificationsStore.removeNotification(id);
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = Math.floor((now - new Date(timestamp)) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
  width: 400px;
  max-width: 90vw;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  pointer-events: none;
  scrollbar-width: none; /* Firefox */
}

.notifications-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.notification {
  background: #ffffff;
  border: 4px solid #000000;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease-out;
  pointer-events: all;
  font-family: 'Pixelify Sans', monospace;
  touch-action: pan-y;
}

.notification-warning {
  border-color: #f59e0b;
}

.notification-critical {
  border-color: #E06264;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #000000;
  line-height: 1.3;
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.close-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.notification-close:hover {
  transform: scale(1.2);
}

.notification-body {
  font-size: 0.85rem;
  color: #333333;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.notification-warning .notification-body {
  color: #d97706;
}

.notification-critical .notification-body {
  color: #D5230C;
  font-weight: 700;
}

.notification-time {
  font-size: 0.7rem;
  color: #666666;
  text-align: right;
  font-weight: 500;
}

/* Animations d'entrée/sortie */
.notification-enter-active {
  animation: slideIn 0.4s ease-out;
}

.notification-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .notifications-container {
    width: calc(100% - 40px);
    right: 20px;
    left: 20px;
  }

  .notification {
    padding: 1rem;
  }

  .notification-title {
    font-size: 1rem;
  }

  .notification-body {
    font-size: 0.9rem;
  }
}
</style>
