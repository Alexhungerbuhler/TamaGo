<template>
  <div class="name-pet-container">
    <div class="name-pet-card">
      <div class="pet-preview">
        <div class="pet-emoji">{{ petEmoji }}</div>
        <p class="pet-species">{{ petSpeciesName }}</p>
      </div>
      
      <h2 class="title">Donnez un nom à votre Tamagotchi !</h2>
      <p class="subtitle">Votre premier compagnon vous attend</p>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-field">
          <label>
            Nom de votre Tamagotchi
            <input
              v-model.trim="petName"
              type="text"
              placeholder="ex: Fluffy"
              autocomplete="off"
              :class="{ 'input-error': error && !petName }"
              :disabled="loading"
              @input="clearError"
              ref="nameInput"
            />
          </label>
          <p v-if="error && !petName" class="field-error">
            Veuillez entrer un nom pour votre Tamagotchi
          </p>
        </div>

        <p v-if="serverError" class="error">{{ serverError }}</p>

        <button type="submit" :disabled="loading || !petName.trim()" class="submit-btn">
          {{ loading ? "Création..." : "Commencer l'aventure !" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePetsStore } from '../store/pets';
import { useAuthStore } from '../store';

const props = defineProps({
  species: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['pet-created']);

const router = useRouter();
const petsStore = usePetsStore();
const authStore = useAuthStore();

const petName = ref('');
const loading = ref(false);
const error = ref(null);
const serverError = ref(null);
const nameInput = ref(null);

// Espèces disponibles avec leurs emojis et noms
const speciesData = {
  cat: { emoji: '🐱', name: 'Chat' },
  dog: { emoji: '🐶', name: 'Chien' },
  bird: { emoji: '🐦', name: 'Oiseau' },
  dragon: { emoji: '🐉', name: 'Dragon' },
  rabbit: { emoji: '🐰', name: 'Lapin' },
  panda: { emoji: '🐼', name: 'Panda' },
  fox: { emoji: '🦊', name: 'Renard' },
  bear: { emoji: '🐻', name: 'Ours' }
};

const petEmoji = ref(speciesData[props.species]?.emoji || '🐣');
const petSpeciesName = ref(speciesData[props.species]?.name || 'Tamagotchi');

function clearError() {
  error.value = null;
  serverError.value = null;
}

async function handleSubmit() {
  if (!petName.value.trim()) {
    error.value = true;
    return;
  }

  loading.value = true;
  error.value = null;
  serverError.value = null;

  try {
    // Créer le pet avec le nom
    const petData = {
      name: petName.value.trim()
    };
    
    const newPet = await petsStore.createPet(petData);
    
    // Essayer de mettre à jour avec l'espèce si le backend le supporte
    if (props.species && (newPet._id || newPet.id)) {
      try {
        await petsStore.updatePet(newPet._id || newPet.id, { species: props.species });
        // Mettre à jour le pet local avec l'espèce
        newPet.species = props.species;
      } catch (updateErr) {
        // Si la mise à jour échoue, ce n'est pas grave, on continue
        console.log('Note: species field may not be supported by backend');
      }
    }

    // Émettre l'événement pour informer le parent
    emit('pet-created', newPet);

    // Rediriger vers la page /tamago pour voir tous les tamagotchis
    router.push('/tamago');
  } catch (err) {
    serverError.value = err.message || 'Erreur lors de la création de votre Tamagotchi';
    console.error('Erreur création pet:', err);
  } finally {
    loading.value = false;
  }
}

// Focus sur l'input au montage
onMounted(() => {
  if (nameInput.value) {
    nameInput.value.focus();
  }
});
</script>

<style scoped>
.name-pet-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.name-pet-card {
  background: #fff;
  padding: 2.5rem;
  border-radius: 1.5rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  text-align: center;
}

.pet-preview {
  margin-bottom: 2rem;
}

.pet-emoji {
  font-size: 5rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.pet-species {
  font-size: 1.25rem;
  color: #64748b;
  font-weight: 600;
  margin: 0;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #64748b;
  margin: 0 0 2rem;
  font-size: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
}

label {
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
}

input {
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

input.input-error {
  border-color: #ef4444;
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-error {
  color: #ef4444;
  margin: 0;
  font-size: 0.875rem;
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

.submit-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #C0FE90 0%, #a8f57a 100%);
  color: #0f172a;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(192, 254, 144, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Mobile */
@media (max-width: 768px) {
  .name-pet-container {
    padding: 1rem;
  }

  .name-pet-card {
    padding: 2rem 1.5rem;
  }

  .pet-emoji {
    font-size: 4rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }
}
</style>

