<template>
  <div>
    <Header :isAuthenticated="isAuthenticated" @navigate="handleNavigate" />
    <TheLogin v-if="!isAuthenticated" @login-success="onLoginSuccess" />
    <div v-else class="page">Bienvenue, {{ currentUser.name }} !</div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import TheLogin from '../components/TheLogin.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);
const currentUser = ref({ name: null });

function onLoginSuccess({ token, user }) {
  isAuthenticated.value = true;
  currentUser.value = user;
  // Idéalement, il faudrait stocker le token dans le localStorage/sessionStorage
  router.push('/');
}

function handleNavigate(target) {
  if (target === 'logout') {
    isAuthenticated.value = false;
    currentUser.value = { name: null };
    router.push('/login');
  } else if (target === 'register') {
    router.push('/register');
  } else if (target === 'login') {
    router.push('/login');
  }
}
</script>