<script setup>
import { reactive, computed } from "vue";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { useFormValidation } from '../composables/useFormValidation';
import { registerSchema } from '../utils/validation';

const emit = defineEmits(["register-success", "navigate-login"]);

const router = useRouter();
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
    const result = await authStore.register(form.name, form.password);
    emit("register-success", { 
      name: form.name,
      user: result.user || { name: form.name, id: result.userId }
    });
    
    // Ne pas rediriger automatiquement vers login, on va créer le pet
    form.name = "";
    form.password = "";
    form.confirmPassword = "";
    reset();
  } catch (err) {
    console.error('Register failed:', err);
  }
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="greeting-title">Hello there !</h1>
      <p class="greeting-subtitle">Let's create an account !</p>

      <form class="register-form" @submit.prevent="handleSubmit">
        <input
          v-model.trim="form.name"
          type="text"
          placeholder="Username"
          autocomplete="username"
          class="input-field"
          :class="{ 'input-error': shouldShowError('name') }"
          @blur="handleBlur('name')"
        />
        <p v-if="shouldShowError('name')" class="field-error">
          {{ getError('name') }}
        </p>

        <input
          v-model="form.password"
          type="password"
          placeholder="Password"
          autocomplete="new-password"
          class="input-field"
          :class="{ 'input-error': shouldShowError('password') }"
          @blur="handleBlur('password')"
        />
        <p v-if="shouldShowError('password')" class="field-error">
          {{ getError('password') }}
        </p>

        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          autocomplete="new-password"
          class="input-field"
          :class="{ 'input-error': shouldShowError('confirmPassword') }"
          @blur="handleBlur('confirmPassword')"
        />
        <p v-if="shouldShowError('confirmPassword')" class="field-error">
          {{ getError('confirmPassword') }}
        </p>

        <!-- Erreur serveur -->
        <p v-if="serverError" class="server-error">{{ serverError }}</p>

        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? "Creating..." : "Register" }}
        </button>
      </form>

      <p class="login-text">Already have an account ?</p>
      <button class="login-button" @click="goToLogin">
        login
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap');

.register-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 2rem 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.greeting-title {
  font-family: 'Pixelify Sans', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.greeting-subtitle {
  font-family: 'Pixelify Sans', monospace;
  font-size: 1.25rem;
  font-weight: 400;
  color: #808080;
  margin: 0 0 3rem 0;
  line-height: 1.2;
}

.register-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.input-field {
  width: 100%;
  padding: 1rem;
  background: #e5e5e5;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  color: #333333;
  box-sizing: border-box;
  transition: background 0.2s;
}

.input-field::placeholder {
  color: #666666;
  font-family: 'Pixelify Sans', monospace;
}

.input-field:focus {
  outline: none;
  background: #d5d5d5;
}

.input-field.input-error {
  background: #ffe5e5;
  border: 2px solid #ff4444;
}

.field-error {
  color: #ff4444;
  margin: -0.5rem 0 0 0;
  font-size: 0.875rem;
  font-family: 'Pixelify Sans', monospace;
  text-align: left;
}

.server-error {
  color: #ff4444;
  background: #ffe5e5;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0;
  font-size: 0.875rem;
  font-family: 'Pixelify Sans', monospace;
}

.register-button {
  width: 100%;
  padding: 1rem;
  background: #4a90e2;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 0.5rem;
}

.register-button:hover:not(:disabled) {
  background: #357abd;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-text {
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
  margin: 1.5rem 0 1rem 0;
}

.login-button {
  padding: 0.875rem 2rem;
  background: #4a90e2;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Pixelify Sans', monospace;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #357abd;
}

/* Mobile */
@media (max-width: 768px) {
  .greeting-title {
    font-size: 2rem;
  }

  .greeting-subtitle {
    font-size: 1.1rem;
  }

  .register-card {
    max-width: 100%;
  }
}
</style>
