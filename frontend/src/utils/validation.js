import { z } from 'zod';

/**
 * Schémas de validation Zod pour les formulaires
 */

// Validation pour le nom d'utilisateur
export const usernameSchema = z
  .string()
  .min(3, 'Le nom doit contenir au moins 3 caractères')
  .max(20, 'Le nom ne peut pas dépasser 20 caractères')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Seuls les lettres, chiffres, tirets et underscores sont autorisés');

// Validation pour le mot de passe
export const passwordSchema = z
  .string()
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(50, 'Le mot de passe ne peut pas dépasser 50 caractères');

// Schéma complet de connexion
export const loginSchema = z.object({
  name: usernameSchema,
  password: passwordSchema
});

// Schéma complet d'inscription
export const registerSchema = z.object({
  name: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

/**
 * Validation manuelle d'un champ
 * @param {any} schema - Schéma Zod
 * @param {any} value - Valeur à valider
 * @returns {string|null} Message d'erreur ou null
 */
export function validateField(schema, value) {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Erreur de validation';
    }
    return 'Erreur de validation';
  }
}

/**
 * Validation d'un objet complet
 * @param {any} schema - Schéma Zod
 * @param {object} data - Données à valider
 * @returns {{errors: object, isValid: boolean}}
 */
export function validateForm(schema, data) {
  try {
    schema.parse(data);
    return { errors: {}, isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { errors, isValid: false };
    }
    return { errors: { _general: 'Erreur de validation' }, isValid: false };
  }
}
