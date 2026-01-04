<script setup>
import { reactive, computed } from "vue";
import { useAuthStore } from '../store';
import { useFormValidation } from '../composables/useFormValidation';
import { registerSchema } from '../utils/validation';

const emit = defineEmits(["register-success", "navigate-login"]);

const authStore = useAuthStore();
const { errors, touchField, validate, shouldShowError, getError, reset } = useFormValidation(registerSchema);

const form = reactive({
  name: "",
  password: "",
  confirmPassword: ""
});

const loading = computed(() => authStore.loading);
const serverError = computed(() => authStore.error);

// Validation en temps réel à la perte de focus
function handleBlur(fieldName) {
  touchField(fieldName);
}

async function handleSubmit() {
  // Marquer tous les champs comme touchés
  touchField('name');
  touchField('password');
  touchField('confirmPassword');

  // Valider le formulaire
  if (!validate(form)) {
    return;
  }

  try {
    await authStore.register(form.name, form.password);
    emit("register-success", { name: form.name });
    
    // Redirection automatique après succès
    setTimeout(() => emit("navigate-login"), 1500);
    
    form.name = "";
    form.password = "";
    form.confirmPassword = "";
    reset();
  } catch (err) {
    console.error('Register failed:', err);
  }
}
</script>

<template>
  <div class="card">
    <h2>Créer un compte</h2>
    <p class="subtitle">Rejoins TamaGo et commence ton aventure !</p>

    <form class="form" @submit.prevent="handleSubmit">
      <div class="form-field">
        <label>
          Nom d'utilisateur
          <input
            v-model.trim="form.name"
            type="text"
            placeholder="ex: alex"
            autocomplete="username"
            :class="{ 'input-error': shouldShowError('name') }"
            @blur="handleBlur('name')"
          />
        </label>
        <p v-if="shouldShowError('name')" class="field-error">
          {{ getError('name') }}
        </p>
      </div>

      <div class="form-field">
        <label>
          Mot de passe
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            :class="{ 'input-error': shouldShowError('password') }"
            @blur="handleBlur('password')"
          />
        </label>
        <p v-if="shouldShowError('password')" class="field-error">
          {{ getError('password') }}
        </p>
      </div>

      <div class="form-field">
        <label>
          Confirme le mot de passe
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            :class="{ 'input-error': shouldShowError('confirmPassword') }"
            @blur="handleBlur('confirmPassword')"
          />
        </label>
        <p v-if="shouldShowError('confirmPassword')" class="field-error">
          {{ getError('confirmPassword') }}
        </p>
      </div>

      <!-- Erreur serveur -->
      <p v-if="serverError" class="error">{{ serverError }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? "Création..." : "Créer mon compte" }}
      </button>
    </form>

    <p class="login-link">
      Déjà un compte ? 
      <a href="#" @click.prevent="emit('navigate-login')">Se connecter</a>
    </p>
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

h2 {
  margin: 0 0 0.5rem;
  color: #0f172a;
  font-size: 1.75rem;
}

.subtitle {
  color: #64748b;
  margin: 0 0 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 500;
  color: #334155;
}

input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

input.input-error {
  border-color: #ef4444;
}

input.input-error:focus {
  border-color: #dc2626;
}

button {
  padding: 0.875rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

button:hover:not(:disabled) {
  background: #2563eb;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  color: #ef4444;
  margin: 0;
  font-size: 0.875rem;
  animation: slideDown 0.2s ease;
}

.error {
  color: #ef4444;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0;
  font-size: 0.875rem;
  border-left: 3px solid #ef4444;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.login-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
