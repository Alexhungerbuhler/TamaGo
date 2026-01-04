import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { statsService } from '../services/api';

export const useStatsStore = defineStore('stats', () => {
  // State
  const globalStats = ref(null);
  const userStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const hasGlobalStats = computed(() => !!globalStats.value);
  const hasUserStats = computed(() => !!userStats.value);
  const isLoading = computed(() => loading.value);

  // Actions
  /**
   * Récupérer les statistiques globales
   */
  async function fetchGlobalStats() {
    loading.value = true;
    error.value = null;

    try {
      const response = await statsService.getGlobal();
      globalStats.value = response.data;
      return globalStats.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des statistiques globales';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  async function fetchUserStats(userId) {
    loading.value = true;
    error.value = null;

    try {
      const response = await statsService.getUserStats(userId);
      userStats.value = response.data;
      return userStats.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des statistiques utilisateur';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Rafraîchir toutes les stats
   */
  async function refreshAllStats(userId) {
    try {
      await Promise.all([
        fetchGlobalStats(),
        userId ? fetchUserStats(userId) : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des stats:', err);
    }
  }

  /**
   * Réinitialiser les stats
   */
  function clearStats() {
    globalStats.value = null;
    userStats.value = null;
    error.value = null;
  }

  return {
    // State
    globalStats,
    userStats,
    loading,
    error,

    // Getters
    hasGlobalStats,
    hasUserStats,
    isLoading,

    // Actions
    fetchGlobalStats,
    fetchUserStats,
    refreshAllStats,
    clearStats
  };
});
