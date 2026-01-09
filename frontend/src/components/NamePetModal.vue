<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="attemptClose">
    <div class="modal-container">
      <div class="modal-content">
        <h2 class="title">Choose a name<br>for your pet:</h2>
        
        <!-- Permanent hint in gray -->
        <p class="field-hint-permanent">
          3-20 caractères, lettres uniquement
        </p>
        
        <!-- Dynamic error message in red (only when error) -->
        <p v-if="validationError" class="field-error">
          <img src="/icons/WarningIcon.svg" class="error-icon" alt="warning"> {{ validationError }}
        </p>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-field">
            <input
              v-model.trim="petName"
              type="text"
              placeholder="Enter a name..."
              autocomplete="off"
              :class="{ 'input-error': validationError }"
              :disabled="loading"
              @input="validateName"
              ref="nameInput"
              maxlength="20"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading || !isNameValid" 
            class="submit-btn"
            :class="{ 'btn-disabled': !isNameValid }"
          >
            {{ loading ? "Création..." : "Valider" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['submit', 'close']);

const petName = ref('');
const loading = ref(false);
const validationError = ref('');
const nameInput = ref(null);

// Validation : 3-20 caractères, lettres uniquement (+ espaces)
const isNameValid = computed(() => {
  const name = petName.value.trim();
  if (name.length < 3 || name.length > 20) return false;
  // Lettres uniquement (majuscules, minuscules, accents) + espaces
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
});

function validateName() {
  validationError.value = '';
  const name = petName.value.trim();
  
  if (name.length === 0) {
    validationError.value = 'Le nom est obligatoire';
    return;
  }
  
  if (name.length < 3) {
    validationError.value = 'Minimum 3 caractères';
    return;
  }
  
  if (name.length > 20) {
    validationError.value = 'Maximum 20 caractères';
    return;
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    validationError.value = 'Lettres uniquement (pas de chiffres ou caractères spéciaux)';
    return;
  }
}

function handleSubmit() {
  validateName();
  
  if (!isNameValid.value) {
    return;
  }

  loading.value = true;
  emit('submit', petName.value.trim());
}

function attemptClose() {
  // Ne pas permettre de fermer le modal (obligatoire de donner un nom)
  // L'utilisateur doit donner un nom valide
  return;
}

// Focus sur l'input quand le modal s'ouvre
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await nextTick();
    if (nameInput.value) {
      nameInput.value.focus();
    }
  }
});

// Réinitialiser le formulaire quand le modal se ferme
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    petName.value = '';
    validationError.value = '';
    loading.value = false;
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  width: 90%;
  max-width: 420px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  padding: 2rem 2rem 2.5rem;
  border: 5px solid #000000;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.field-hint-permanent {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #808080;
  font-weight: 500;
  text-align: center;
  line-height: 1.5;
}

.field-error {
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
  color: #D5230C;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  text-align: center;
}

.form-field input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: 4px solid #000000;
  border-radius: 16px;
  outline: none;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', monospace;
  box-sizing: border-box;
  background: #e8e8e8;
  color: #000000;
  text-align: center;
  font-weight: 500;
}

.form-field input::placeholder {
  color: #999999;
  font-style: normal;
}

.form-field input:focus {
  border-color: #000000;
  background: #f5f5f5;
  transform: scale(1.02);
}

.form-field input.input-error {
  border-color: #ff0000;
  background: #ffe6e6;
}

.submit-btn {
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  background: #ffb84d;
  color: #ffffff;
  border: 4px solid #000000;
  border-radius: 16px;
  cursor: pointer;
  font-family: 'Pixelify Sans', monospace;
  text-transform: capitalize;
}

.submit-btn:disabled,
.submit-btn.btn-disabled {
  background: #cccccc;
  border-color: #999999;
  color: #666666;
  cursor: not-allowed;
}

/* Style pixel art pour correspondre au reste du jeu */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-content {
    padding: 1.5rem 1.5rem 2rem;
    border-width: 4px;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .form-field input {
    font-size: 1rem;
    padding: 0.875rem 1.25rem;
  }
  
  .submit-btn {
    font-size: 1.1rem;
    padding: 0.875rem 1.75rem;
  }
}
</style>
