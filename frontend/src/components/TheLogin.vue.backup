login.vue

<script setup>
import { reactive, ref } from "vue";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const emit = defineEmits(["login-success"]);

const form = reactive({
  name: "",
  password: ""
});

const loading = ref(false);
const error = ref("");

async function handleSubmit() {
  error.value = "";
  if (!form.name || !form.password) {
    error.value = "Merci d’indiquer votre nom et votre mot de passe.";
    return;
  }
  loading.value = true;

  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Identifiants invalides");
    }

    const data = await response.json();
    emit("login-success", {
      token: data.token,
      user: { name: form.name }
    });
    form.password = "";
  } catch (err) {
    error.value = err.message || "Impossible de se connecter";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card">
    <h2>Connexion</h2>
    <p class="subtitle">Connecte-toi à ton compte TamaGo.</p>

    <form class="form" @submit.prevent="handleSubmit">
      <label>
        Nom d’utilisateur
        <input
          v-model.trim="form.name"
          type="text"
          placeholder="ex: admin"
          autocomplete="username"
        />
      </label>

      <label>
        Mot de passe
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
        />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.subtitle {
  margin-top: 0.35rem;
  color: #475569;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #0f172a;
}

input {
  border: 1px solid rgba(148, 163, 184, 0.8);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
  margin-top: 0.5rem;
  transition: opacity 0.15s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin: 0;
  font-weight: 600;
}
</style>

