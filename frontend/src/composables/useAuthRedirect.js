import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';

/**
 * Composable pour gérer les redirections avec authentification
 */
export function useAuthRedirect() {
  const router = useRouter();
  const authStore = useAuthStore();

  /**
   * Redirige vers la page de login si non authentifié
   * @param {string} returnPath - Chemin de retour après connexion
   */
  function requireAuth(returnPath = null) {
    if (!authStore.isAuthenticated) {
      router.push({
        name: 'Login',
        query: { redirect: returnPath || router.currentRoute.value.fullPath }
      });
      return false;
    }
    return true;
  }

  /**
   * Redirige vers home si déjà authentifié
   */
  function requireGuest() {
    if (authStore.isAuthenticated) {
      router.push({ name: 'Home' });
      return false;
    }
    return true;
  }

  /**
   * Déconnexion et redirection vers login
   */
  function logout() {
    authStore.logout();
    router.push({ name: 'Login' });
  }

  return {
    requireAuth,
    requireGuest,
    logout,
    isAuthenticated: authStore.isAuthenticated
  };
}
