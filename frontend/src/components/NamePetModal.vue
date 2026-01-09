<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="attemptClose">
    <div class="modal-container">
      <div class="modal-content">
        <div class="pet-preview">
          <div class="pet-emoji">🥚→✨</div>
        </div>
        
        <h2 class="title">Nommez votre Tamagotchi !</h2>
        <p class="subtitle">Votre compagnon attend son nom</p>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-field">
            <label>
              <input
                v-model.trim="petName"
                type="text"
                placeholder="ex: Pixel"
                autocomplete="off"
                :class="{ 'input-error': validationError }"
                :disabled="loading"
                @input="validateName"
                ref="nameInput"
                maxlength="20"
              />
            </label>
            <p v-if="validationError" class="field-error">
              {{ validationError }}
            </p>
            <p v-else class="field-hint">
              3-20 caractères, lettres uniquement
            </p>
          </div>

          <button 
            type="submit" 
            :disabled="loading || !isNameValid" 
            class="submit-btn"
            :class="{ 'btn-disabled': !isNameValid }"
          >
            {{ loading ? "✨ Création..." : "🚀 Valider" }}
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
  background: rgba(0, 0, 0, 0.75);
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
  max-width: 400px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  background: #fff;
  padding: 2rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-family: 'Pixelify Sans', monospace;
}

.pet-preview {
  margin-bottom: 1.5rem;
}

.pet-emoji {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.1);
  }
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #666;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  text-align: left;
}

.form-field label {
  display: block;
  width: 100%;
}

.form-field input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', monospace;
  box-sizing: border-box;
}

.form-field input:focus {
  border-color: #6bcf7f;
  box-shadow: 0 0 0 3px rgba(107, 207, 127, 0.1);
}

.form-field input.input-error {
  border-color: #ff6b6b;
}

.field-error {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #ff6b6b;
}

.field-hint {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.submit-btn {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #6bcf7f 0%, #5ab36b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pixelify Sans', monospace;
  box-shadow: 0 4px 12px rgba(107, 207, 127, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 207, 127, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled,
.submit-btn.btn-disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Style pixel art pour correspondre au reste du jeu */
@media (max-width: 480px) {
  .modal-container {
    width: 95%;
  }
  
  .modal-content {
    padding: 1.5rem 1rem;
  }
  
  .title {
    font-size: 1.25rem;
  }
  
  .pet-emoji {
    font-size: 3rem;
  }
}
</style>
