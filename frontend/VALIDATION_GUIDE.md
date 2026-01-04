# ✅ Validation de Formulaires - Guide d'Utilisation

## 🎯 Ce qui a été implémenté

### 1. **Système de validation avec Zod**
- ✅ Schémas de validation réutilisables
- ✅ Messages d'erreur en français
- ✅ Validation en temps réel (on blur)
- ✅ Validation à la soumission

### 2. **Composables et utils**
- ✅ `useFormValidation` - Composable pour gérer la validation
- ✅ `validation.js` - Schémas Zod (login, register)

### 3. **Composants mis à jour**
- ✅ `TheLogin.vue` - Validation complète
- ✅ `RegisterForm.vue` - Validation avec confirmation de mot de passe

---

## 📦 Packages installés

```bash
npm install @vee-validate/zod zod
```

- **Zod** : Validation de schémas TypeScript-first
- **@vee-validate/zod** : Intégration Vee-Validate avec Zod

---

## 🔧 Fichiers créés/modifiés

### Nouveaux fichiers
✅ `src/utils/validation.js` - Schémas de validation  
✅ `src/composables/useFormValidation.js` - Composable de validation

### Fichiers modifiés
✅ `src/components/TheLogin.vue` - Ajout validation  
✅ `src/components/RegisterForm.vue` - Recréé avec validation

---

## 📚 Comment utiliser la validation

### Exemple 1: Validation d'un formulaire simple

```vue
<script setup>
import { reactive } from 'vue';
import { useFormValidation } from '../composables/useFormValidation';
import { loginSchema } from '../utils/validation';

const { errors, touchField, validate, shouldShowError, getError, reset } = useFormValidation(loginSchema);

const form = reactive({
  name: "",
  password: ""
});

function handleBlur(fieldName) {
  touchField(fieldName);
}

async function handleSubmit() {
  touchField('name');
  touchField('password');
  
  if (!validate(form)) {
    return; // Erreurs de validation
  }
  
  // Soumettre le formulaire...
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-field">
      <label>
        Nom
        <input
          v-model="form.name"
          :class="{ 'input-error': shouldShowError('name') }"
          @blur="handleBlur('name')"
        />
      </label>
      <p v-if="shouldShowError('name')" class="field-error">
        {{ getError('name') }}
      </p>
    </div>
    
    <button type="submit">Envoyer</button>
  </form>
</template>
```

### Exemple 2: Créer un nouveau schéma de validation

```javascript
// Dans src/utils/validation.js

import { z } from 'zod';

export const tamagotchiSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(30, 'Le nom ne peut pas dépasser 30 caractères'),
  
  species: z
    .string()
    .min(1, 'Veuillez sélectionner une espèce'),
  
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format hex requis)')
});
```

### Exemple 3: Validation personnalisée

```javascript
export const customSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis'),
    
  age: z
    .number()
    .min(13, 'Vous devez avoir au moins 13 ans')
    .max(120, 'Âge invalide')
}).refine((data) => {
  // Validation personnalisée
  return data.age >= 18 || data.parentalConsent;
}, {
  message: 'Consentement parental requis pour les mineurs',
  path: ['parentalConsent']
});
```

---

## 🎨 Styles des erreurs

### Classes CSS disponibles

```css
.input-error {
  border-color: #ef4444; /* Rouge pour input invalide */
}

.field-error {
  color: #ef4444; /* Message d'erreur de champ */
  font-size: 0.875rem;
  animation: slideDown 0.2s ease;
}

.error {
  color: #ef4444; /* Erreur générale/serveur */
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border-left: 3px solid #ef4444;
}
```

---

## 🧪 Tests de validation

### Test Login
1. Laisser les champs vides → "Le nom doit contenir au moins 3 caractères"
2. Entrer "ab" → "Le nom doit contenir au moins 3 caractères"
3. Entrer "user@123" → "Seuls les lettres, chiffres, tirets et underscores sont autorisés"
4. Entrer "user" + "12345" → "Le mot de passe doit contenir au moins 6 caractères"
5. Entrer "user" + "password123" → ✅ Validation réussie

### Test Register
1. Mot de passe différent de confirmation → "Les mots de passe ne correspondent pas"
2. Nom trop court → "Le nom doit contenir au moins 3 caractères"
3. Mot de passe trop court → "Le mot de passe doit contenir au moins 6 caractères"
4. Tout valide → ✅ Création du compte

---

## 🎯 Règles de validation actuelles

### Nom d'utilisateur (`usernameSchema`)
- ✅ Minimum 3 caractères
- ✅ Maximum 20 caractères
- ✅ Seulement lettres, chiffres, tirets et underscores
- ✅ Pas d'espaces

### Mot de passe (`passwordSchema`)
- ✅ Minimum 6 caractères
- ✅ Maximum 50 caractères

### Inscription (`registerSchema`)
- ✅ Nom d'utilisateur valide
- ✅ Mot de passe valide
- ✅ Confirmation de mot de passe identique

---

## 💡 Bonnes pratiques

### 1. **Validation progressive**
```javascript
// Ne pas valider avant que l'utilisateur ait touché le champ
@blur="touchField('name')"
```

### 2. **Messages clairs**
```javascript
.min(3, 'Le nom doit contenir au moins 3 caractères') // ✅ Clair
.min(3, 'Trop court') // ❌ Vague
```

### 3. **Réinitialiser après succès**
```javascript
async function handleSubmit() {
  if (!validate(form)) return;
  
  await submitForm();
  reset(); // Nettoie les erreurs
}
```

### 4. **Séparer erreurs client vs serveur**
```vue
<!-- Erreurs de validation -->
<p v-if="shouldShowError('name')" class="field-error">
  {{ getError('name') }}
</p>

<!-- Erreurs serveur -->
<p v-if="serverError" class="error">
  {{ serverError }}
</p>
```

---

## 🚀 Prochaines améliorations possibles

- [ ] **Validation asynchrone** - Vérifier disponibilité du nom d'utilisateur
- [ ] **Force du mot de passe** - Indicateur visuel
- [ ] **Debouncing** - Validation avec délai pour les requêtes API
- [ ] **Messages personnalisés** - Par langue/contexte
- [ ] **Validation conditionnelle** - Selon d'autres champs

---

## 📝 Exemple complet - Tamagotchi

```vue
<script setup>
import { reactive } from 'vue';
import { useFormValidation } from '../composables/useFormValidation';
import { z } from 'zod';

const tamagotchiSchema = z.object({
  name: z.string().min(2).max(30),
  species: z.enum(['cat', 'dog', 'bird']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
});

const { errors, touchField, validate, shouldShowError, getError } = useFormValidation(tamagotchiSchema);

const form = reactive({
  name: '',
  species: '',
  color: '#000000'
});

async function handleSubmit() {
  touchField('name');
  touchField('species');
  touchField('color');
  
  if (!validate(form)) {
    return;
  }
  
  // Créer le Tamagotchi...
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="form.name"
      :class="{ 'input-error': shouldShowError('name') }"
      @blur="touchField('name')"
    />
    <p v-if="shouldShowError('name')" class="field-error">
      {{ getError('name') }}
    </p>
    
    <select
      v-model="form.species"
      :class="{ 'input-error': shouldShowError('species') }"
      @blur="touchField('species')"
    >
      <option value="">Choisir...</option>
      <option value="cat">Chat</option>
      <option value="dog">Chien</option>
      <option value="bird">Oiseau</option>
    </select>
    
    <button type="submit">Créer</button>
  </form>
</template>
```

---

## ✅ Résumé

✅ **Validation robuste** avec Zod  
✅ **Messages d'erreur clairs** en français  
✅ **Validation en temps réel** (on blur)  
✅ **Réutilisable** via composables  
✅ **Styles cohérents** avec animations  
✅ **Documentation complète**  

**Tu peux maintenant créer de nouveaux formulaires validés en quelques minutes !** 🚀
