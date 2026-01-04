import { ref, reactive } from 'vue';
import { validateField, validateForm } from '../utils/validation';

/**
 * Composable pour gérer la validation de formulaires
 * @param {object} schema - Schéma Zod de validation
 */
export function useFormValidation(schema) {
  const errors = reactive({});
  const touched = reactive({});
  const isSubmitting = ref(false);

  /**
   * Valide un champ spécifique
   * @param {string} fieldName - Nom du champ
   * @param {any} value - Valeur du champ
   */
  function validateSingleField(fieldName, value) {
    // Extraire le schéma du champ depuis le schéma complet
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) return;

    const error = validateField(fieldSchema, value);
    if (error) {
      errors[fieldName] = error;
    } else {
      delete errors[fieldName];
    }
  }

  /**
   * Marque un champ comme touché
   * @param {string} fieldName - Nom du champ
   */
  function touchField(fieldName) {
    touched[fieldName] = true;
  }

  /**
   * Valide le formulaire complet
   * @param {object} data - Données du formulaire
   * @returns {boolean} Vrai si valide
   */
  function validate(data) {
    const result = validateForm(schema, data);
    
    // Réinitialiser les erreurs
    Object.keys(errors).forEach(key => delete errors[key]);
    
    // Ajouter les nouvelles erreurs
    Object.keys(result.errors).forEach(key => {
      errors[key] = result.errors[key];
    });

    return result.isValid;
  }

  /**
   * Réinitialise la validation
   */
  function reset() {
    Object.keys(errors).forEach(key => delete errors[key]);
    Object.keys(touched).forEach(key => delete touched[key]);
    isSubmitting.value = false;
  }

  /**
   * Vérifie si un champ doit afficher une erreur
   * @param {string} fieldName - Nom du champ
   * @returns {boolean}
   */
  function shouldShowError(fieldName) {
    return touched[fieldName] && !!errors[fieldName];
  }

  /**
   * Obtient le message d'erreur d'un champ
   * @param {string} fieldName - Nom du champ
   * @returns {string|null}
   */
  function getError(fieldName) {
    return errors[fieldName] || null;
  }

  return {
    errors,
    touched,
    isSubmitting,
    validateSingleField,
    touchField,
    validate,
    reset,
    shouldShowError,
    getError
  };
}
