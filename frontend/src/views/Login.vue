<template>
  <div class="login-page">
    <TheLogin v-if="!authStore.isAuthenticated" @login-success="onLoginSuccess" />
    <div v-else class="page">Bienvenue, {{ authStore.currentUser?.name }} !</div>
  </div>
</template>

<script setup>
import TheLogin from '../components/TheLogin.vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

async function onLoginSuccess() {
  // Récupérer le premier pet de l'utilisateur et rediriger vers lui
  try {
    const { usePetsStore } = await import('../store/pets');
    const petsStore = usePetsStore();
    
    // Attendre un peu pour que l'auth soit bien établie
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await petsStore.fetchPets({ userId: authStore.currentUser?.id });
    
    if (petsStore.petsList && petsStore.petsList.length > 0) {
      // Rediriger vers le premier pet
      const firstPet = petsStore.petsList[0];
      const petId = firstPet._id || firstPet.id;
      router.push(`/tamagotchi/${petId}`);
    } else {
      // Si pas de pet, rediriger vers home
      router.push('/');
    }
  } catch (err) {
    console.error('Erreur lors du chargement des pets:', err);
    // En cas d'erreur, rediriger vers home
    router.push('/');
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}
</style>