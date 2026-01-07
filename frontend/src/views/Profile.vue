<template>
  <div class="page profile-page">
    <h2>Profil utilisateur</h2>
    <div v-if="user">
      <div class="user-info">
        <div><strong>Nom :</strong> {{ user.name }}</div>
        <div v-if="user.email"><strong>Email :</strong> {{ user.email }}</div>
      </div>
      <ChangePasswordForm />
    </div>
    <div v-else>
      <em>Non connecté.</em>
    </div>
    <div v-if="petStats" class="pet-stats">
      <h3>Statistiques de votre pet</h3>
      <div><strong>Durée de vie :</strong> {{ petStats.ageDays }} jours</div>
      <div><strong>Nombre de repas :</strong> {{ petStats.mealsCount }}</div>
      <div v-if="petStats.poopsCount !== undefined"><strong>Nombre de toilettes :</strong> {{ petStats.poopsCount }}</div>
      <div v-if="petStats.gamesCount !== undefined"><strong>Nombre de jeux :</strong> {{ petStats.gamesCount }}</div>
    </div>
    <button class="btn-back" @click="goBack">Retour</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/index'
import { usePetsStore } from '@/store/pets'
import ChangePasswordForm from '@/components/ChangePasswordForm.vue'

const authStore = useAuthStore()
const petsStore = usePetsStore()
const user = authStore.currentUser
const petStats = ref(null)
const router = useRouter()

function goBack() {
  router.back()
}

onMounted(async () => {
  // On suppose que le pet courant est le pet principal de l'utilisateur
  if (petsStore.currentPet) {
    try {
      petStats.value = await petsStore.fetchPetStats(petsStore.currentPet._id || petsStore.currentPet.id)
    } catch {}
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.profile-page {
  max-width: 500px;
  margin: 2em auto;
  padding: 2em;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  position: relative;
  font-family: 'Pixelify Sans', monospace;
}
.user-info {
  margin-bottom: 2em;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.1rem;
}
.profile-page h2 {
  font-family: 'Pixelify Sans', monospace;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}
.pet-stats {
  margin-top: 2em;
  background: #f8f8f8;
  border-radius: 8px;
  padding: 1em 1.5em;
  font-family: 'Pixelify Sans', monospace;
}
.pet-stats h3 {
  margin-top: 0;
  font-size: 1.3rem;
  font-family: 'Pixelify Sans', monospace;
}
.btn-back {
  display: block;
  margin: 2.5em auto 0 auto;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  background: #627DE0;
  color: #ffffff;
}
.btn-back:hover {
  background: #5169c7;
}
.btn-back:active {
  transform: scale(0.98);
}
</style>