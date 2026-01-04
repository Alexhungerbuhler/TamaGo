<template>
  <div>
    <Header :isAuthenticated="authStore.isAuthenticated" :currentUser="authStore.currentUser" @navigate="handleNavigate" />
    <TheLogin v-if="!authStore.isAuthenticated" @login-success="onLoginSuccess" />
    <div v-else class="page">Bienvenue, {{ authStore.currentUser?.name }} !</div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import TheLogin from '../components/TheLogin.vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

function onLoginSuccess() {
  // Redirection vers la page d'origine ou vers home
  const redirectPath = route.query.redirect || '/';
  router.push(redirectPath);
}

function handleNavigate(target) {
  if (target === 'logout') {
    authStore.logout();
    router.push('/login');
  } else if (target === 'register') {
    router.push('/register');
  } else if (target === 'login') {
    router.push('/login');
  }
}
</script>