<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page non trouvée</p>
    <router-link to="/" class="btn">Retour à l'accueil</router-link>
  </div>
</template>

<script setup>
// Page 404
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.not-found h1 {
  font-size: 5rem;
  margin: 0;
  color: #3b82f6;
}

.not-found p {
  font-size: 1.5rem;
  color: #64748b;
  margin: 1rem 0 2rem;
}

.btn {
  padding: 0.875rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: #2563eb;
}
</style>
