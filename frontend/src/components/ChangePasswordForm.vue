<template>
  <form @submit.prevent="submit" class="change-password-form">
    <h3>Changer le mot de passe</h3>
    <div>
      <label>Nouveau mot de passe</label>
      <input v-model="password" type="password" required />
    </div>
    <div>
      <label>Confirmer le mot de passe</label>
      <input v-model="confirm" type="password" required />
    </div>
    <button type="submit" :disabled="loading">Valider</button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Mot de passe changé !</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '@/services/api'

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  error.value = ''
  success.value = false
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  loading.value = true
  try {
    // À adapter selon l'API backend
    await authService.changePassword(password.value)
    success.value = true
    password.value = ''
    confirm.value = ''
  } catch (e) {
    error.value = e.message || 'Erreur lors du changement.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-form {
  margin-top: 1.5em;
  padding: 1em;
  border: 1px solid #eee;
  border-radius: 8px;
  max-width: 350px;
}
.change-password-form label {
  display: block;
  margin-bottom: 0.2em;
}
.change-password-form input {
  width: 100%;
  margin-bottom: 1em;
}
.error { color: #c00; margin-top: 0.5em; }
.success { color: #090; margin-top: 0.5em; }
</style>
