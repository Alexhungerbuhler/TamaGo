<template>
  <div>
    <Header :isAuthenticated="isAuthenticated" :currentUser="currentUser" @navigate="handleNavigate" />
    <div class="page">
      <template v-if="isAuthenticated">
        Bienvenue, {{ currentUser.name }} !
      </template>
      <template v-else>
        Bienvenue sur TamaGo !
        <router-link to="/login">Connexion</router-link> ou
        <router-link to="/register">Créer un compte</router-link>
      </template>
    </div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';

const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = authStore.isAuthenticated;
const currentUser = authStore.currentUser;

function handleNavigate(target) {
  if (target === 'logout') {
    authStore.logout();
    router.push('/login');
  } else if (target === 'register') {
    router.push('/register');
  } else if (target === 'login') {
    router.push('/login');
  } else if (target === 'test-api') {
    router.push('/test-api');
  } else if (target === 'tamagotchis') {
    router.push('/tamagotchis');
  } else if (target === 'map') {
    router.push('/map');
  } else if (target === 'home') {
    router.push('/');
  }
}
</script>

<style scoped>
.page{font-size:1.2rem;margin:2rem;}
</style>