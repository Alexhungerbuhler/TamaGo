import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gamesService } from '../services/api';
import { useNotificationsStore } from './notifications';

export const useGamesStore = defineStore('games', () => {
  const notificationsStore = useNotificationsStore();
  
  // State
  const games = ref([]);
  const currentGame = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const gameResult = ref(null);

  /**
   * Récupérer la liste de tous les jeux disponibles
   */
  async function fetchGames() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await gamesService.list();
      games.value = response.data.games || [];
      return games.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des jeux';
      notificationsStore.addNotification({
        title: 'Erreur',
        message: error.value,
        level: 'error'
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Récupérer les détails d'un jeu
   * @param {string} gameId - ID du jeu
   */
  async function fetchGame(gameId) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await gamesService.getGame(gameId);
      currentGame.value = response.data;
      return currentGame.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement du jeu';
      notificationsStore.addNotification({
        title: 'Erreur',
        message: error.value,
        level: 'error'
      });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Jouer à un jeu avec un pet
   * @param {string} petId - ID du pet
   * @param {string} gameId - ID du jeu
   * @param {number} score - Score obtenu (optionnel)
   */
  async function playGame(petId, gameId, score = 0) {
    loading.value = true;
    error.value = null;
    gameResult.value = null;
    
    try {
      const response = await gamesService.playGame(petId, gameId, score);
      gameResult.value = response.data;
      
      // Notification de succès
      notificationsStore.addNotification({
        title: '🎮 Jeu terminé !',
        message: response.data.message,
        level: 'success',
        type: 'game'
      });
      
      return gameResult.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du jeu';
      
      // Notification d'erreur spécifique
      if (err.status === 400 && err.data?.message?.includes('energy')) {
        notificationsStore.addNotification({
          title: '⚡ Pas assez d\'énergie',
          message: 'Votre Tamagotchi est trop fatigué pour jouer !',
          level: 'warning',
          type: 'energy'
        });
      } else {
        notificationsStore.addNotification({
          title: 'Erreur',
          message: error.value,
          level: 'error'
        });
      }
      
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Trouver un jeu par son ID dans la liste
   * @param {string} gameId - ID du jeu
   */
  function getGameById(gameId) {
    return games.value.find(game => game.id === gameId);
  }

  /**
   * Réinitialiser le résultat du dernier jeu
   */
  function clearGameResult() {
    gameResult.value = null;
  }

  return {
    // State
    games,
    currentGame,
    loading,
    error,
    gameResult,
    
    // Actions
    fetchGames,
    fetchGame,
    playGame,
    getGameById,
    clearGameResult
  };
});
