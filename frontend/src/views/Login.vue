<template>
  <div class="login-page">
    <TheLogin @login-success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import TheLogin from '../components/TheLogin.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';

const router = useRouter();
const authStore = useAuthStore();

// Si déjà authentifié, rediriger vers dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  }
});

function onLoginSuccess() {
  // Rediriger vers le dashboard après connexion
  router.push('/dashboard');
}
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
}
</style>