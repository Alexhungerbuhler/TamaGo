<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="['notification', `notification-${notif.level}`]"
        @click="markAsRead(notif.id)"
      >
        <div class="notification-header">
          <span class="notification-title">{{ notif.title }}</span>
          <button class="notification-close" @click.stop="remove(notif.id)">
            ×
          </button>
        </div>
        <div class="notification-body">
          {{ notif.message }}
        </div>
        <div v-if="notif.stats" class="notification-stats">
          <span>❤️ {{ notif.stats.health }}</span>
          <span>🍔 {{ notif.stats.hunger }}</span>
          <span>😊 {{ notif.stats.happiness }}</span>
        </div>
        <div class="notification-time">
          {{ formatTime(notif.timestamp) }}
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationsStore } from '../store/notifications';

const notificationsStore = useNotificationsStore();

const notifications = computed(() => 
  notificationsStore.notifications.slice(0, 5)
);

function markAsRead(id) {
  notificationsStore.markAsRead(id);
}

function remove(id) {
  notificationsStore.removeNotification(id);
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = Math.floor((now - new Date(timestamp)) / 1000);
  
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 100;
  width: 350px;
  max-width: 90vw;
  max-height: calc(100vh - 90px);
  overflow-y: auto;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid;
  pointer-events: all;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.notification-warning {
  border-color: #f59e0b;
  background: #fffbeb;
}

.notification-critical {
  border-color: #ef4444;
  background: #fef2f2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 600;
  font-size: 1rem;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #333;
}

.notification-body {
  margin-bottom: 0.5rem;
  color: #666;
}

.notification-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #999;
}

/* Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
