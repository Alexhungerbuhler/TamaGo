<script setup>
const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(["navigate"]);

function navigate(view) {
  emit("navigate", view);
}
</script>

<template>
  <header class="header">
    <div class="brand" @click="navigate('home')">
      <span class="logo">🐣</span>
      <div>
        <strong>TamaGo</strong>
        <small>Happy Tamagotchi chat</small>
      </div>
    </div>
    <nav>
      <button
        v-if="!isAuthenticated"
        class="ghost"
        @click="navigate('login')"
      >
        Login
      </button>
      <button
        v-if="!isAuthenticated"
        class="primary"
        @click="navigate('register')"
      >
        Register
      </button>
      <button v-else class="danger" @click="navigate('logout')">Logout</button>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
}

.brand {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  cursor: pointer;
}

.logo {
  font-size: 1.75rem;
}

nav {
  display: flex;
  gap: 0.75rem;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.2rem;
  font-weight: 600;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.ghost {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.primary {
  background: #2563eb;
  color: #fff;
}

.danger {
  background: #ef4444;
  color: #fff;
}
</style>
