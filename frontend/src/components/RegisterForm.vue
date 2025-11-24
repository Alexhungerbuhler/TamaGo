<script setup>
import { reactive, ref } from "vue";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const emit = defineEmits(["register-success", "navigate-login"]);

const form = reactive({
  name: "",
  password: "",
  confirmPassword: ""
});

const loading = ref(false);
const error = ref("");
const success = ref("");

async function handleSubmit() {
  error.value = "";
  success.value = "";

  if (!form.name || !form.password || !form.confirmPassword) {
    error.value = "Merci de remplir tous les champs.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name,
        password: form.password
      })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "Impossible de créer le compte");
    }

    success.value = "Compte créé ! Tu peux maintenant te connecter.";
    emit("register-success", { name: form.name });

    setTimeout(() => emit("navigate-login"), 1200);
    form.password = "";
    form.confirmPassword = "";
  } catch (err) {
    error.value = err.message || "Erreur lors de l’enregistrement";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card">
    <h2>Créer un compte</h2>
    <p class="subtitle">
      Cette action appelle `POST /users` sur ton backend local (MongoDB).
    </p>

    <form class="form" @submit.prevent="handleSubmit">
      <label>
        Nom d’utilisateur
        <input
          v-model.trim="form.name"
          type="text"
          placeholder="ex: alex"
          autocomplete="username"
        />
      </label>

      <label>
        Mot de passe
        <input
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
        />
      </label>

      <label>
        Confirme le mot de passe
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
        />
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? "Création..." : "Créer le compte" }}
      </button>

      <button
        type="button"
        class="ghost"
        :disabled="loading"
        @click="emit('navigate-login')"
      >
        J’ai déjà un compte
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
  background: #10b981;
  color: #fff;
  transition: opacity 0.15s ease;
}

button.ghost {
  margin-top: 0.25rem;
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.2);
  color: #0f172a;
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

.success {
  color: #16a34a;
  margin: 0;
  font-weight: 600;
}
</style>

