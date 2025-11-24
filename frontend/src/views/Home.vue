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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);
const currentUser = ref({ name: null });

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

<style scoped>
.page{font-size:1.2rem;margin:2rem;}
</style>