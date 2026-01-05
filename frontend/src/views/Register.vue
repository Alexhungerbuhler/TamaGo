<template>
  <div class="register-page">
    <!-- Étape 1: Formulaire d'inscription -->
    <RegisterForm 
      v-if="!isAuthenticated && !showNamePet" 
      @register-success="onRegisterSuccess" 
    />
    
    <!-- Étape 2: Nommer le pet -->
    <NamePet 
      v-if="isAuthenticated && showNamePet" 
      :species="randomSpecies"
      @pet-created="onPetCreated"
    />
    
    <div v-if="isAuthenticated && !showNamePet && !hasPet" class="page">
      Vous êtes déjà connecté, {{ currentUser.name }}.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { usePetsStore } from '../store/pets'
import RegisterForm from '../components/RegisterForm.vue'
import NamePet from '../components/NamePet.vue'

const router = useRouter();
const authStore = useAuthStore();
const petsStore = usePetsStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.currentUser);
const showNamePet = ref(false);
const randomSpecies = ref('');

// Espèces disponibles
const speciesList = ['cat', 'dog', 'bird', 'dragon', 'rabbit', 'panda', 'fox', 'bear'];

// Générer une espèce aléatoire
function getRandomSpecies() {
  return speciesList[Math.floor(Math.random() * speciesList.length)];
}

// Vérifier si l'utilisateur a déjà des pets
const hasPet = computed(() => {
  return petsStore.petsList && petsStore.petsList.length > 0;
});

async function onRegisterSuccess({ user }) {
  // Si l'inscription réussit et que l'utilisateur est connecté
  if (authStore.isAuthenticated) {
    // Vérifier si l'utilisateur a déjà des pets
    try {
      await petsStore.fetchPets({ userId: authStore.currentUser.id });
      
      // Si l'utilisateur n'a pas de pets, afficher le formulaire de nommage
      if (petsStore.petsList.length === 0) {
        randomSpecies.value = getRandomSpecies();
        showNamePet.value = true;
      } else {
        // Si l'utilisateur a déjà des pets, rediriger vers la liste
        router.push('/tamagotchis');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des pets:', err);
      // En cas d'erreur, afficher quand même le formulaire de nommage
      randomSpecies.value = getRandomSpecies();
      showNamePet.value = true;
    }
  }
}

function onPetCreated(pet) {
  // Le composant NamePet redirige déjà vers la page du pet
  // Cette fonction peut être utilisée pour d'autres actions si nécessaire
  showNamePet.value = false;
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.page {
  font-size: 1.2rem;
  margin: 2rem;
}
</style>
