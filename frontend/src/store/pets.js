import { defineStore } from 'pinia';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { petsService, statsService } from '../services/api';
import wsService from '../services/websocket';
import { useNotificationsStore } from './notifications';

export const usePetsStore = defineStore('pets', () => {
  const notificationsStore = useNotificationsStore();
  
  // State
  const pets = ref([]);
  const currentPet = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: false
  });

  // WebSocket listeners
  let unsubscribeUpdate;
  let unsubscribeAlert;
  let unsubscribeCritical;

  // Initialiser les écouteurs WebSocket
  function initWebSocketListeners() {
    // Mise à jour des stats d'un pet
    unsubscribeUpdate = wsService.on('pet:updated', (data) => {
      updatePetStats(data.petId, data.stats);
    });

    // Alertes
    unsubscribeAlert = wsService.on('pet:alert', (data) => {
      notificationsStore.addNotification({
        title: `⚠️ ${data.name}`,
        message: data.message,
        level: 'warning',
        type: data.type,
        petId: data.petId
      });
    });

    unsubscribeCritical = wsService.on('pet:critical', (data) => {
      notificationsStore.addNotification({
        title: `🚨 ${data.name}`,
        message: data.message,
        level: 'critical',
        type: 'health',
        petId: data.petId
      });
    });
  }

  // Nettoyer les écouteurs
  function cleanupWebSocketListeners() {
    if (unsubscribeUpdate) unsubscribeUpdate();
    if (unsubscribeAlert) unsubscribeAlert();
    if (unsubscribeCritical) unsubscribeCritical();
  }

  // Mettre à jour les stats d'un pet
  function updatePetStats(petId, stats) {
    // Mettre à jour dans la liste
    const index = pets.value.findIndex(p => p._id === petId || p.id === petId);
    if (index !== -1) {
      pets.value[index] = {
        ...pets.value[index],
        ...stats
      };
    }

    // Mettre à jour currentPet si c'est lui
    if (currentPet.value?._id === petId || currentPet.value?.id === petId) {
      currentPet.value = {
        ...currentPet.value,
        ...stats
      };
    }
  }

  // Getters
  const petsList = computed(() => pets.value);
  const isLoading = computed(() => loading.value);
  const getPetById = computed(() => (id) => {
    return pets.value.find(pet => pet._id === id || pet.id === id);
  });

  // Actions
  /**
   * Récupérer la liste des pets avec filtres
   */
  async function fetchPets(params = {}) {
    loading.value = true;
    error.value = null;

    try {
      const response = await petsService.list({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      });
      
      const data = response.data;
      
      // Si la réponse contient la pagination
      if (data.pagination) {
        pets.value = data.data || [];
        pagination.value = {
          page: data.pagination.page || 1,
          limit: data.pagination.limit || 10,
          total: data.pagination.total || 0,
          hasMore: (data.pagination.page || 1) < (data.pagination.pages || 1)
        };
      } else if (data.pets) {
        pets.value = data.pets;
        pagination.value = {
          page: data.page || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          hasMore: data.hasMore || false
        };
      } else if (Array.isArray(data)) {
        // Sinon, c'est directement un tableau
        pets.value = data;
      } else if (data.data && Array.isArray(data.data)) {
        // Format avec data.data
        pets.value = data.data;
      }
      
      return pets.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des pets';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Récupérer un pet spécifique
   */
  async function fetchPet(id) {
    loading.value = true;
    error.value = null;

    try {
      const response = await petsService.getById(id);
      
      // Force reactivity by creating a new object reference
      currentPet.value = { ...response.data };
      
      // Mettre à jour dans la liste si présent
      const index = pets.value.findIndex(p => p._id === id || p.id === id);
      if (index !== -1) {
        pets.value[index] = { ...response.data };
      }
      
      return currentPet.value;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement du pet';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Créer un nouveau pet
   */
  async function createPet(petData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await petsService.create(petData);
      const newPet = response.data;
      
      // Ajouter le nouveau pet à la liste
      pets.value.unshift(newPet);
      
      return newPet;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la création du pet';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Mettre à jour un pet
   */
  async function updatePet(id, petData) {
    loading.value = true;
    error.value = null;

    try {
      const response = await petsService.update(id, petData);
      const updatedPet = response.data;
      
      // Mettre à jour dans la liste
      await updatePetInList(id, updatedPet);
      
      return updatedPet;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la mise à jour du pet';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Supprimer un pet
   */
  async function deletePet(id) {
    loading.value = true;
    error.value = null;

    try {
      await petsService.delete(id);
      
      // Retirer le pet de la liste
      pets.value = pets.value.filter(p => p._id !== id && p.id !== id);
      
      if (currentPet.value?._id === id || currentPet.value?.id === id) {
        currentPet.value = null;
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors de la suppression du pet';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Nourrir un pet
   */
  async function feedPet(id) {
    try {
      const response = await petsService.feed(id);
      await updatePetInList(id, response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors du nourrissage';
      throw err;
    }
  }

  /**
   * Emmener le pet aux toilettes
   */
  async function toiletPet(id) {
    try {
      const response = await petsService.toilet(id);
      await updatePetInList(id, response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors de l\'action toilette';
      throw err;
    }
  }

  /**
   * Faire dormir le pet
   */
  async function sleepPet(id) {
    try {
      const response = await petsService.sleep(id);
      await updatePetInList(id, response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors de l\'endormissement';
      throw err;
    }
  }

  /**
   * Jouer avec le pet
   */
  async function playWithPet(id) {
    try {
      const response = await petsService.play(id);
      await updatePetInList(id, response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors du jeu';
      throw err;
    }
  }

  /**
   * Déplacer le pet
   */
  async function movePet(id, location) {
    try {
      const response = await petsService.move(id, location);
      await updatePetInList(id, response.data);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors du déplacement';
      throw err;
    }
  }

  /**
   * Récupérer les stats d'un pet
   */
  async function fetchPetStats(id) {
    try {
      const response = await statsService.getPetStats(id);
      return response.data;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des stats';
      throw err;
    }
  }

  /**
   * Incrémenter le compteur de poops
   */
  async function incrementPoops(id) {
    try {
      const response = await statsService.incrementPoops(id);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de l\'incrémentation des poops:', err);
      throw err;
    }
  }

  /**
   * Incrémenter le compteur de jeux
   */
  async function incrementGames(id) {
    try {
      const response = await statsService.incrementGames(id);
      return response.data;
    } catch (err) {
      console.error('Erreur lors de l\'incrémentation des jeux:', err);
      throw err;
    }
  }

  /**
   * Mettre à jour un pet dans la liste et dans currentPet
   */
  function updatePetInList(id, updatedPet) {
    const index = pets.value.findIndex(p => p._id === id || p.id === id);
    if (index !== -1) {
      pets.value[index] = updatedPet;
    }
    
    if (currentPet.value?._id === id || currentPet.value?.id === id) {
      currentPet.value = updatedPet;
    }
  }

  /**
   * Changer de page
   */
  function setPage(page) {
    pagination.value.page = page;
  }

  /**
   * Réinitialiser les erreurs
   */
  function clearError() {
    error.value = null;
  }

  // Initialiser les écouteurs WebSocket au démarrage
  initWebSocketListeners();

  return {
    // State
    pets,
    currentPet,
    loading,
    error,
    pagination,

    // Getters
    petsList,
    isLoading,
    getPetById,

    // Actions
    fetchPets,
    fetchPet,
    createPet,
    updatePet,
    deletePet,
    feedPet,
    toiletPet,
    sleepPet,
    playWithPet,
    movePet,
    fetchPetStats,
    incrementPoops,
    incrementGames,
    setPage,
    clearError,
    
    // WebSocket
    initWebSocketListeners,
    cleanupWebSocketListeners
  };
});
