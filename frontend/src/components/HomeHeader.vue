<template>
  <header class="home-header">
    <div class="brand" @click="navigate('home')">
      <span class="logo">🐣</span>
      <strong>TamaGo</strong>
    </div>
    <button 
      v-if="!isAuthenticated"
      class="login-btn" 
      @click="navigate('login')"
    >
      Connexion
    </button>
    <button 
      v-else
      class="logout-btn" 
      @click="handleLogout"
    >
      Déconnexion
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/index';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

function navigate(target) {
  if (target === 'home') {
    router.push('/');
  } else if (target === 'login') {
    router.push('/login');
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.brand {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.brand:hover {
  transform: scale(1.05);
}

.brand:active {
  transform: scale(0.98);
}

.logo {
  font-size: 1.75rem;
}

.brand strong {
  font-size: 1.25rem;
  color: #0f172a;
  font-weight: 700;
}

.login-btn {
  border: 2px solid #2563eb;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  white-space: nowrap;
}

.login-btn:hover {
  background: #2563eb;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.logout-btn {
  border: 2px solid #ef4444;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #ef4444;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .home-header {
    padding: 0.875rem 1rem;
  }

  .logo {
    font-size: 1.5rem;
  }

  .brand strong {
    font-size: 1.1rem;
  }

  .brand {
    gap: 0.5rem;
  }

  .login-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .logout-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .home-header {
    padding: 0.75rem 0.875rem;
  }

  .logo {
    font-size: 1.35rem;
  }

  .brand strong {
    font-size: 1rem;
  }

  .login-btn {
    padding: 0.45rem 0.875rem;
    font-size: 0.85rem;
  }
}
</style>

