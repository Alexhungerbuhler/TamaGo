<template>
  <div>
    <Header :isAuthenticated="isAuthenticated" @navigate="handleNavigate" />
    <RegisterForm v-if="!isAuthenticated" @register-success="onRegisterSuccess" />
    <div v-else class="page">Vous êtes déjà connecté, {{ currentUser.name }}.</div>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import RegisterForm from '../components/RegisterForm.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter();
const isAuthenticated = ref(false);
const currentUser = ref({ name: null });

function onRegisterSuccess({ user }) {
  // Après inscription, on peut soit connecter automatiquement, soit renvoyer vers la page de login
  router.push('/login');
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
  } else if (target === 'home') {
    router.push('/');
  }
}
</script>

<style scoped>
.page{font-size:1.2rem;margin:2rem;}
</style>
